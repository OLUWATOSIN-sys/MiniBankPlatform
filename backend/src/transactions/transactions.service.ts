import { 
  Injectable, 
  BadRequestException, 
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { AccountsService } from '../accounts/accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { Currency } from '../accounts/entities/account.entity';
import { LedgerEntryType } from '../ledger/entities/ledger.entity';

@Injectable()
export class TransactionsService {
  private readonly USD_TO_EUR_RATE: number;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
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
   * Uses TypeORM QueryRunner for atomic transactions
   */
  async transfer(userId: string, transferDto: TransferDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
      const transaction = queryRunner.manager.getRepository(Transaction).create({
        type: TransactionType.TRANSFER,
        status: TransactionStatus.PENDING,
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount,
        currency: transferDto.currency,
        description: transferDto.description || `Transfer to ${toAccount.userId}`,
      });
      await queryRunner.manager.save(transaction);

      // Update account balances
      const updatedFromAccount = await this.accountsService.updateBalance(
        fromAccount.id,
        -amount,
        queryRunner,
      );
      const updatedToAccount = await this.accountsService.updateBalance(
        toAccount.id,
        amount,
        queryRunner,
      );

      // Create double-entry ledger records
      await this.ledgerService.createTransferEntries(
        fromAccount.id,
        toAccount.id,
        transaction.id,
        amount,
        updatedFromAccount.balance,
        updatedToAccount.balance,
        queryRunner,
      );

      // Verify ledger balance
      const isBalanced = await this.ledgerService.verifyTransactionBalance(
        transaction.id,
      );
      if (!isBalanced) {
        throw new InternalServerErrorException('Ledger entries are not balanced');
      }

      // Mark transaction as completed
      transaction.status = TransactionStatus.COMPLETED;
      await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Exchange currency within user's accounts
   * Uses TypeORM QueryRunner for atomic transactions
   */
  async exchange(userId: string, exchangeDto: ExchangeDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
      const transaction = queryRunner.manager.getRepository(Transaction).create({
        type: TransactionType.EXCHANGE,
        status: TransactionStatus.PENDING,
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: fromAmount,
        currency: exchangeDto.fromCurrency,
        exchangeRate,
        convertedAmount: toAmount,
        description: `Exchange ${fromAmount} ${exchangeDto.fromCurrency} to ${toAmount} ${exchangeDto.toCurrency}`,
      });
      await queryRunner.manager.save(transaction);

      // Update account balances
      const updatedFromAccount = await this.accountsService.updateBalance(
        fromAccount.id,
        -fromAmount,
        queryRunner,
      );
      const updatedToAccount = await this.accountsService.updateBalance(
        toAccount.id,
        toAmount,
        queryRunner,
      );

      // Create double-entry ledger records
      await this.ledgerService.createExchangeEntries(
        fromAccount.id,
        toAccount.id,
        transaction.id,
        fromAmount,
        toAmount,
        updatedFromAccount.balance,
        updatedToAccount.balance,
        queryRunner,
      );

      // Mark transaction as completed
      transaction.status = TransactionStatus.COMPLETED;
      await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
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
    const accountIds = accounts.map(acc => acc.id);

    // Build query
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.fromAccount', 'fromAccount')
      .leftJoinAndSelect('transaction.toAccount', 'toAccount')
      .where('transaction.fromAccountId IN (:...accountIds)', { accountIds })
      .orWhere('transaction.toAccountId IN (:...accountIds)', { accountIds });

    if (queryDto.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: queryDto.type });
    }

    // Calculate pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const [transactions, total] = await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Format response
    const formattedTransactions = transactions.map(tx => {
      const isDebit = accountIds.includes(tx.fromAccountId);
      return {
        id: tx.id,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        currency: tx.currency,
        exchangeRate: tx.exchangeRate,
        convertedAmount: tx.convertedAmount,
        description: tx.description,
        isDebit,
        fromAccount: tx.fromAccount,
        toAccount: tx.toAccount,
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
