import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { AccountsService } from '../accounts/accounts.service';
import { LedgerService } from '../ledger/ledger.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let accountsService: AccountsService;
  let ledgerService: LedgerService;

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue(mockTransactionRepository),
        save: jest.fn(),
      },
    }),
  };

  const mockAccountsService = {
    findByUserIdAndCurrency: jest.fn(),
    updateBalance: jest.fn(),
    findByUserId: jest.fn(),
  };

  const mockLedgerService = {
    createTransferEntries: jest.fn(),
    createExchangeEntries: jest.fn(),
    verifyTransactionBalance: jest.fn().mockResolvedValue(true),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('0.92'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
        {
          provide: LedgerService,
          useValue: mockLedgerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    accountsService = module.get<AccountsService>(AccountsService);
    ledgerService = module.get<LedgerService>(LedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('roundToTwoDecimals', () => {
    it('should round to 2 decimal places', () => {
      expect(service.roundToTwoDecimals(10.123)).toBe(10.12);
      expect(service.roundToTwoDecimals(10.125)).toBe(10.13);
      expect(service.roundToTwoDecimals(10.999)).toBe(11.00);
    });
  });

  describe('getExchangeRate', () => {
    it('should return 1 for same currency', () => {
      expect(service.getExchangeRate('USD' as any, 'USD' as any)).toBe(1);
    });

    it('should return correct rate for USD to EUR', () => {
      expect(service.getExchangeRate('USD' as any, 'EUR' as any)).toBe(0.92);
    });

    it('should return correct rate for EUR to USD', () => {
      const rate = service.getExchangeRate('EUR' as any, 'USD' as any);
      expect(rate).toBeCloseTo(1.087, 2);
    });
  });
});
