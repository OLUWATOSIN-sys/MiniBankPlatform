import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Account, Currency } from './entities/account.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createInitialAccounts(userId: string): Promise<Account[]> {
    const usdAccount = this.accountRepository.create({
      userId,
      currency: Currency.USD,
      balance: 1000.00,
    });

    const eurAccount = this.accountRepository.create({
      userId,
      currency: Currency.EUR,
      balance: 500.00,
    });

    return this.accountRepository.save([usdAccount, eurAccount]);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return this.accountRepository.find({ where: { userId } });
  }

  async findById(accountId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async findByUserIdAndCurrency(userId: string, currency: Currency): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { userId, currency },
    });
    if (!account) {
      throw new NotFoundException(`${currency} account not found for user`);
    }
    return account;
  }

  async updateBalance(accountId: string, amount: number, queryRunner?: QueryRunner): Promise<Account> {
    const repo = queryRunner ? queryRunner.manager.getRepository(Account) : this.accountRepository;
    
    const account = await repo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const newBalance = this.roundToTwoDecimals(account.balance + amount);
    
    if (newBalance < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    account.balance = newBalance;
    return repo.save(account);
  }

  async getBalance(accountId: string): Promise<number> {
    const account = await this.findById(accountId);
    return account.balance;
  }

  roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  async findAllUsers(): Promise<any[]> {
    const users = await this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email'],
    });
    
    return users.map(user => ({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }));
  }
}
