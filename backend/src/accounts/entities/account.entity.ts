import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ledger } from '../../ledger/entities/ledger.entity';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
}

@Entity('accounts')
@Index(['userId', 'currency'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column('decimal', { 
    precision: 10, 
    scale: 2, 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  balance: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, user => user.accounts)
  user: User;

  @OneToMany(() => Ledger, ledger => ledger.account)
  ledgerEntries: Ledger[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
