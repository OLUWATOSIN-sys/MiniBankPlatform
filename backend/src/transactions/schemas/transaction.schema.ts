import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Currency } from '../../accounts/schemas/account.schema';

export type TransactionDocument = Transaction & Document;

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

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  fromAccountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  toAccountId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, enum: Currency })
  currency: Currency;

  @Prop({ type: Number })
  exchangeRate: number;

  @Prop({ type: Number })
  convertedAmount: number;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes for efficient queries
TransactionSchema.index({ fromAccountId: 1, createdAt: -1 });
TransactionSchema.index({ toAccountId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });
