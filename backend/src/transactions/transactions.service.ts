import { 
  Injectable, 
  BadRequestException, 
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from './schemas/transaction.schema';
import { AccountsService } from '../accounts/accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { Currency } from '../accounts/schemas/account.schema';
import { LedgerEntryType } from '../ledger/schemas/ledger.schema';

@Injectable()
export class TransactionsService {
  private readonly USD_TO_EUR_RATE: number;

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectConnection() private connection: Connection,
    private accountsService: AccountsService,
    private ledgerService: LedgerService,
    private configService: ConfigService,
  ) {
    this.USD_TO_EUR_RATE = parseFloat(
      this.configService.get<string>('USD_TO_EUR_RATE', '0.92')
    );
  }

  /**
   * Transfer funds between users (same currency)
   * Uses MongoDB session for atomic transactions
   */
  async transfer(userId: string, transferDto: TransferDto): Promise<TransactionDocument> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Get sender's account
      const fromAccount = await this.accountsService.findByUserIdAndCurrency(
        userId,
        transferDto.currency,
      );

      // Get recipient's account
      const toAccount = await this.accountsService.findByUserIdAndCurrency(
        transferDto.toUserId,
        transferDto.currency,
      );

      // Validate amount
      const amount = this.roundToTwoDecimals(transferDto.amount);
      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than zero');
      }

      // Check if sender has sufficient funds
      if (fromAccount.balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // Check if sender and recipient are different
      if (fromAccount.userId.toString() === toAccount.userId.toString()) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      // Create transaction record
      const transaction = new this.transactionModel({
        type: TransactionType.TRANSFER,
        status: TransactionStatus.PENDING,
        fromAccountId: fromAccount._id,
        toAccountId: toAccount._id,
        amount,
        currency: transferDto.currency,
        description: transferDto.description || `Transfer to ${toAccount.userId}`,
      });
      await transaction.save({ session });

      // Update account balances
      const updatedFromAccount = await this.accountsService.updateBalance(
        fromAccount._id.toString(),
        -amount,
        session,
      );
      const updatedToAccount = await this.accountsService.updateBalance(
        toAccount._id.toString(),
        amount,
        session,
      );

      // Create double-entry ledger records
      await this.ledgerService.createTransferEntries(
        fromAccount._id.toString(),
        toAccount._id.toString(),
        transaction._id.toString(),
        amount,
        updatedFromAccount.balance,
        updatedToAccount.balance,
        session,
      );

      // Verify ledger balance
      const isBalanced = await this.ledgerService.verifyTransactionBalance(
        transaction._id.toString(),
      );
      if (!isBalanced) {
        throw new InternalServerErrorException('Ledger entries are not balanced');
      }

      // Mark transaction as completed
      transaction.status = TransactionStatus.COMPLETED;
      await transaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Exchange currency within user's accounts
   * Uses MongoDB session for atomic transactions
   */
  async exchange(userId: string, exchangeDto: ExchangeDto): Promise<TransactionDocument> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Validate currencies are different
      if (exchangeDto.fromCurrency === exchangeDto.toCurrency) {
        throw new BadRequestException('Cannot exchange to the same currency');
      }

      // Get user's accounts
      const fromAccount = await this.accountsService.findByUserIdAndCurrency(
        userId,
        exchangeDto.fromCurrency,
      );
      const toAccount = await this.accountsService.findByUserIdAndCurrency(
        userId,
        exchangeDto.toCurrency,
      );

      // Validate amount
      const fromAmount = this.roundToTwoDecimals(exchangeDto.amount);
      if (fromAmount <= 0) {
        throw new BadRequestException('Amount must be greater than zero');
      }

      // Check if user has sufficient funds
      if (fromAccount.balance < fromAmount) {
        throw new BadRequestException('Insufficient funds');
      }

      // Calculate converted amount based on exchange rate
      let toAmount: number;
      let exchangeRate: number;

      if (exchangeDto.fromCurrency === Currency.USD && exchangeDto.toCurrency === Currency.EUR) {
        exchangeRate = this.USD_TO_EUR_RATE;
        toAmount = this.roundToTwoDecimals(fromAmount * exchangeRate);
      } else if (exchangeDto.fromCurrency === Currency.EUR && exchangeDto.toCurrency === Currency.USD) {
        exchangeRate = this.roundToTwoDecimals(1 / this.USD_TO_EUR_RATE);
        toAmount = this.roundToTwoDecimals(fromAmount * exchangeRate);
      } else {
        throw new BadRequestException('Invalid currency exchange pair');
      }

      // Create transaction record
      const transaction = new this.transactionModel({
        type: TransactionType.EXCHANGE,
        status: TransactionStatus.PENDING,
        fromAccountId: fromAccount._id,
        toAccountId: toAccount._id,
        amount: fromAmount,
        currency: exchangeDto.fromCurrency,
        exchangeRate,
        convertedAmount: toAmount,
        description: `Exchange ${fromAmount} ${exchangeDto.fromCurrency} to ${toAmount} ${exchangeDto.toCurrency}`,
      });
      await transaction.save({ session });

      // Update account balances
      const updatedFromAccount = await this.accountsService.updateBalance(
        fromAccount._id.toString(),
        -fromAmount,
        session,
      );
      const updatedToAccount = await this.accountsService.updateBalance(
        toAccount._id.toString(),
        toAmount,
        session,
      );

      // Create double-entry ledger records
      await this.ledgerService.createExchangeEntries(
        fromAccount._id.toString(),
        toAccount._id.toString(),
        transaction._id.toString(),
        fromAmount,
        toAmount,
        updatedFromAccount.balance,
        updatedToAccount.balance,
        exchangeRate,
        session,
      );

      // Mark transaction as completed
      transaction.status = TransactionStatus.COMPLETED;
      await transaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get transaction history for a user with filters and pagination
   */
  async getTransactions(
    userId: string,
    queryDto: QueryTransactionsDto,
  ): Promise<{ transactions: any[]; total: number; page: number; limit: number }> {
    // Get user's accounts
    const accounts = await this.accountsService.findByUserId(userId);
    const accountIds = accounts.map(acc => acc._id);

    // Build query
    const query: any = {
      $or: [
        { fromAccountId: { $in: accountIds } },
        { toAccountId: { $in: accountIds } },
      ],
    };

    if (queryDto.type) {
      query.type = queryDto.type;
    }

    // Calculate pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('fromAccountId', 'currency userId')
        .populate('toAccountId', 'currency userId'),
      this.transactionModel.countDocuments(query),
    ]);

    // Format response
    const formattedTransactions = transactions.map(tx => {
      const isDebit = accountIds.some(id => id.toString() === tx.fromAccountId._id.toString());
      return {
        id: tx._id,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        currency: tx.currency,
        exchangeRate: tx.exchangeRate,
        convertedAmount: tx.convertedAmount,
        description: tx.description,
        isDebit,
        fromAccount: tx.fromAccountId,
        toAccount: tx.toAccountId,
        createdAt: tx.createdAt,
      };
    });

    return {
      transactions: formattedTransactions,
      total,
      page,
      limit,
    };
  }

  /**
   * Get recent transactions (for dashboard)
   */
  async getRecentTransactions(userId: string, limit: number = 5): Promise<any[]> {
    const result = await this.getTransactions(userId, { page: 1, limit });
    return result.transactions;
  }

  /**
   * Get exchange rate
   */
  getExchangeRate(from: Currency, to: Currency): number {
    if (from === to) {
      return 1;
    }
    if (from === Currency.USD && to === Currency.EUR) {
      return this.USD_TO_EUR_RATE;
    }
    if (from === Currency.EUR && to === Currency.USD) {
      return this.roundToTwoDecimals(1 / this.USD_TO_EUR_RATE);
    }
    throw new BadRequestException('Invalid currency pair');
  }

  roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
