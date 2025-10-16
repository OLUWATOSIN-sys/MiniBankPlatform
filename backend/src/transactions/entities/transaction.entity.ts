import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Ledger } from '../../ledger/entities/ledger.entity';
import { Currency } from '../../accounts/entities/account.entity';

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  EXCHANGE = 'EXCHANGE',
  INITIAL_DEPOSIT = 'INITIAL_DEPOSIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('transactions')
@Index(['fromAccountId', 'createdAt'])
@Index(['toAccountId', 'createdAt'])
@Index(['type'])
@Index(['status'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column()
  fromAccountId: string;

  @Column({ nullable: true })
  toAccountId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  exchangeRate: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  convertedAmount: number;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Account)
  fromAccount: Account;

  @ManyToOne(() => Account)
  toAccount: Account;

  @OneToMany(() => Ledger, ledger => ledger.transaction)
  ledgerEntries: Ledger[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
