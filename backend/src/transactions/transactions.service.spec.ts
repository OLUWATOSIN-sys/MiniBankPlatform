import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from './transactions.service';
import { Transaction } from './schemas/transaction.schema';
import { AccountsService } from '../accounts/accounts.service';
import { LedgerService } from '../ledger/ledger.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let accountsService: AccountsService;
  let ledgerService: LedgerService;

  const mockTransactionModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
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
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
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
