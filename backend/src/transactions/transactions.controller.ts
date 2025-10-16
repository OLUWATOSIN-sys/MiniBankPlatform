import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Query,
  UseGuards, 
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds to another user' })
  async transfer(@Request() req, @Body() transferDto: TransferDto) {
    const transaction = await this.transactionsService.transfer(
      req.user.userId,
      transferDto,
    );
    return {
      success: true,
      transactionId: transaction.id,
      message: 'Transfer completed successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    };
  }

  @Post('exchange')
  @ApiOperation({ summary: 'Exchange currency between accounts' })
  async exchange(@Request() req, @Body() exchangeDto: ExchangeDto) {
    const transaction = await this.transactionsService.exchange(
      req.user.userId,
      exchangeDto,
    );
    return {
      success: true,
      transactionId: transaction.id,
      message: 'Exchange completed successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        exchangeRate: transaction.exchangeRate,
        convertedAmount: transaction.convertedAmount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get transaction history with filters and pagination' })
  @ApiQuery({ name: 'type', required: false, enum: ['TRANSFER', 'EXCHANGE'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTransactions(
    @Request() req,
    @Query() queryDto: QueryTransactionsDto,
  ) {
    return this.transactionsService.getTransactions(req.user.userId, queryDto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions (for dashboard)' })
  async getRecentTransactions(@Request() req) {
    const transactions = await this.transactionsService.getRecentTransactions(
      req.user.userId,
    );
    return { transactions };
  }
}
