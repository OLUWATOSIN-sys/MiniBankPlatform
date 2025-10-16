import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
}

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: Currency })
  currency: Currency;

  @Prop({ required: true, type: Number, default: 0 })
  balance: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Create compound index for user and currency (each user can have only one account per currency)
AccountSchema.index({ userId: 1, currency: 1 }, { unique: true });
// Index for faster balance queries
AccountSchema.index({ userId: 1 });
