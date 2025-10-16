import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument, Currency } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async createInitialAccounts(userId: string): Promise<AccountDocument[]> {
    const usdAccount = new this.accountModel({
      userId: new Types.ObjectId(userId),
      currency: Currency.USD,
      balance: 1000.00,
    });

    const eurAccount = new this.accountModel({
      userId: new Types.ObjectId(userId),
      currency: Currency.EUR,
      balance: 500.00,
    });

    return Promise.all([usdAccount.save(), eurAccount.save()]);
  }

  async findByUserId(userId: string): Promise<AccountDocument[]> {
    return this.accountModel.find({ userId: new Types.ObjectId(userId) });
  }

  async findById(accountId: string): Promise<AccountDocument> {
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async findByUserIdAndCurrency(userId: string, currency: Currency): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({
      userId: new Types.ObjectId(userId),
      currency,
    });
    if (!account) {
      throw new NotFoundException(`${currency} account not found for user`);
    }
    return account;
  }

  async updateBalance(accountId: string, amount: number, session?: any): Promise<AccountDocument> {
    const account = await this.accountModel.findById(accountId).session(session || null);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const newBalance = this.roundToTwoDecimals(account.balance + amount);
    
    if (newBalance < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    account.balance = newBalance;
    return account.save({ session });
  }

  async getBalance(accountId: string): Promise<number> {
    const account = await this.findById(accountId);
    return account.balance;
  }

  roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  async findAllUsers(): Promise<any[]> {
    const accounts = await this.accountModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $group: {
          _id: '$userId',
          firstName: { $first: '$user.firstName' },
          lastName: { $first: '$user.lastName' },
          email: { $first: '$user.email' },
        },
      },
      {
        $project: {
          userId: '$_id',
          firstName: 1,
          lastName: 1,
          email: 1,
          _id: 0,
        },
      },
    ]);
    return accounts;
  }
}
