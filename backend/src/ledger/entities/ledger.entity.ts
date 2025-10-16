import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum LedgerEntryType {
  TRANSFER = 'TRANSFER',
  EXCHANGE = 'EXCHANGE',
  INITIAL_DEPOSIT = 'INITIAL_DEPOSIT',
}

@Entity('ledger')
@Index(['accountId', 'createdAt'])
@Index(['transactionId'])
@Index(['entryType'])
export class Ledger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountId: string;

  @Column()
  transactionId: string;

  @Column('decimal', { 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  amount: number; // Positive for credit, negative for debit

  @Column('decimal', { 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  balanceAfter: number; // Balance after this entry

  @Column({
    type: 'enum',
    enum: LedgerEntryType,
  })
  entryType: LedgerEntryType;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Account, account => account.ledgerEntries)
  account: Account;

  @ManyToOne(() => Transaction, transaction => transaction.ledgerEntries)
  transaction: Transaction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
