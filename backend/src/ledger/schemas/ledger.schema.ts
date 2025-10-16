import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LedgerDocument = Ledger & Document;

export enum LedgerEntryType {
  TRANSFER = 'TRANSFER',
  EXCHANGE = 'EXCHANGE',
  INITIAL_DEPOSIT = 'INITIAL_DEPOSIT',
}

@Schema({ timestamps: true })
export class Ledger {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true })
  transactionId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number; // Positive for credit, negative for debit

  @Prop({ required: true, type: Number })
  balanceAfter: number; // Balance after this entry

  @Prop({ required: true, enum: LedgerEntryType })
  entryType: LedgerEntryType;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const LedgerSchema = SchemaFactory.createForClass(Ledger);

// Indexes for efficient queries
LedgerSchema.index({ accountId: 1, createdAt: -1 });
LedgerSchema.index({ transactionId: 1 });
LedgerSchema.index({ entryType: 1 });
