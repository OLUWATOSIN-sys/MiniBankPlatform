import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Ledger, LedgerEntryType } from './entities/ledger.entity';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(Ledger)
    private ledgerRepository: Repository<Ledger>,
  ) {}

  async createEntry(
    accountId: string,
    transactionId: string,
    amount: number,
    balanceAfter: number,
    entryType: LedgerEntryType,
    description?: string,
    queryRunner?: QueryRunner,
  ): Promise<Ledger> {
    const repo = queryRunner ? queryRunner.manager.getRepository(Ledger) : this.ledgerRepository;
    
    const ledgerEntry = repo.create({
      accountId,
      transactionId,
      amount,
      balanceAfter,
      entryType,
      description,
    });

    return repo.save(ledgerEntry);
  }

  async createTransferEntries(
    fromAccountId: string,
    toAccountId: string,
    transactionId: string,
    amount: number,
    fromBalanceAfter: number,
    toBalanceAfter: number,
    queryRunner?: QueryRunner,
  ): Promise<Ledger[]> {
    const entries = await Promise.all([
      this.createEntry(
        fromAccountId,
        transactionId,
        -amount, // Debit
        fromBalanceAfter,
        LedgerEntryType.TRANSFER,
        'Transfer out',
        queryRunner,
      ),
      this.createEntry(
        toAccountId,
        transactionId,
        amount, // Credit
        toBalanceAfter,
        LedgerEntryType.TRANSFER,
        'Transfer in',
        queryRunner,
      ),
    ]);
    return entries;
  }

  async createExchangeEntries(
    fromAccountId: string,
    toAccountId: string,
    transactionId: string,
    fromAmount: number,
    toAmount: number,
    fromBalanceAfter: number,
    toBalanceAfter: number,
    queryRunner?: QueryRunner,
  ): Promise<Ledger[]> {
    const entries = await Promise.all([
      this.createEntry(
        fromAccountId,
        transactionId,
        -fromAmount, // Debit
        fromBalanceAfter,
        LedgerEntryType.EXCHANGE,
        'Currency exchange out',
        queryRunner,
      ),
      this.createEntry(
        toAccountId,
        transactionId,
        toAmount, // Credit
        toBalanceAfter,
        LedgerEntryType.EXCHANGE,
        'Currency exchange in',
        queryRunner,
      ),
    ]);
    return entries;
  }

  async verifyTransactionBalance(transactionId: string): Promise<boolean> {
    const entries = await this.ledgerRepository.find({
      where: { transactionId },
    });

    const total = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
    return Math.abs(total) < 0.01; // Account for floating point precision
  }

  async getAccountHistory(accountId: string, limit = 100): Promise<Ledger[]> {
    return this.ledgerRepository.find({
      where: { accountId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
