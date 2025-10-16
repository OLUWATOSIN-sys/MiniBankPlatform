import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ledger, LedgerDocument, LedgerEntryType } from './schemas/ledger.schema';

@Injectable()
export class LedgerService {
  constructor(
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
  ) {}

  /**
   * Create a double-entry ledger entry
   * For each transaction, we create balanced entries where sum of amounts = 0
   */
  async createEntry(
    accountId: string,
    transactionId: string,
    amount: number,
    balanceAfter: number,
    entryType: LedgerEntryType,
    description: string,
    metadata: Record<string, any> = {},
    session?: any,
  ): Promise<LedgerDocument> {
    const entry = new this.ledgerModel({
      accountId: new Types.ObjectId(accountId),
      transactionId: new Types.ObjectId(transactionId),
      amount: this.roundToTwoDecimals(amount),
      balanceAfter: this.roundToTwoDecimals(balanceAfter),
      entryType,
      description,
      metadata,
    });

    return entry.save({ session });
  }

  /**
   * Create balanced double-entry records for a transfer
   */
  async createTransferEntries(
    fromAccountId: string,
    toAccountId: string,
    transactionId: string,
    amount: number,
    fromBalanceAfter: number,
    toBalanceAfter: number,
    session?: any,
  ): Promise<LedgerDocument[]> {
    const fromEntry = await this.createEntry(
      fromAccountId,
      transactionId,
      -amount, // Debit (negative)
      fromBalanceAfter,
      LedgerEntryType.TRANSFER,
      `Transfer to account ${toAccountId}`,
      { direction: 'debit', relatedAccount: toAccountId },
      session,
    );

    const toEntry = await this.createEntry(
      toAccountId,
      transactionId,
      amount, // Credit (positive)
      toBalanceAfter,
      LedgerEntryType.TRANSFER,
      `Transfer from account ${fromAccountId}`,
      { direction: 'credit', relatedAccount: fromAccountId },
      session,
    );

    return [fromEntry, toEntry];
  }

  /**
   * Create balanced double-entry records for currency exchange
   */
  async createExchangeEntries(
    fromAccountId: string,
    toAccountId: string,
    transactionId: string,
    fromAmount: number,
    toAmount: number,
    fromBalanceAfter: number,
    toBalanceAfter: number,
    exchangeRate: number,
    session?: any,
  ): Promise<LedgerDocument[]> {
    const fromEntry = await this.createEntry(
      fromAccountId,
      transactionId,
      -fromAmount, // Debit (negative)
      fromBalanceAfter,
      LedgerEntryType.EXCHANGE,
      `Exchange to account ${toAccountId}`,
      { 
        direction: 'debit', 
        relatedAccount: toAccountId, 
        exchangeRate,
        convertedAmount: toAmount,
      },
      session,
    );

    const toEntry = await this.createEntry(
      toAccountId,
      transactionId,
      toAmount, // Credit (positive)
      toBalanceAfter,
      LedgerEntryType.EXCHANGE,
      `Exchange from account ${fromAccountId}`,
      { 
        direction: 'credit', 
        relatedAccount: fromAccountId, 
        exchangeRate,
        originalAmount: fromAmount,
      },
      session,
    );

    return [fromEntry, toEntry];
  }

  /**
   * Verify ledger integrity for a transaction
   * Sum of all amounts for a transaction should equal zero
   */
  async verifyTransactionBalance(transactionId: string): Promise<boolean> {
    const entries = await this.ledgerModel.find({ 
      transactionId: new Types.ObjectId(transactionId) 
    });

    const sum = entries.reduce((total, entry) => total + entry.amount, 0);
    // Allow for small floating point errors
    return Math.abs(sum) < 0.01;
  }

  /**
   * Get ledger entries for an account
   */
  async getEntriesByAccount(
    accountId: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<LedgerDocument[]> {
    return this.ledgerModel
      .find({ accountId: new Types.ObjectId(accountId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  /**
   * Calculate account balance from ledger entries (for verification)
   */
  async calculateBalanceFromLedger(accountId: string): Promise<number> {
    const entries = await this.ledgerModel.find({ 
      accountId: new Types.ObjectId(accountId) 
    });

    const balance = entries.reduce((total, entry) => total + entry.amount, 0);
    return this.roundToTwoDecimals(balance);
  }

  roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
