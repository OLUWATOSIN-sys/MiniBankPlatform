import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(
    private accountsService: AccountsService,
    private usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts for current user' })
  async getAccounts(@Request() req) {
    const accounts = await this.accountsService.findByUserId(req.user.userId);
    return accounts.map(account => ({
      id: account._id,
      currency: account.currency,
      balance: account.balance,
      createdAt: account.createdAt,
    }));
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users for transfers' })
  async getAllUsers(@Request() req) {
    const users = await this.accountsService.findAllUsers();
    // Filter out current user
    return users.filter(user => user.userId.toString() !== req.user.userId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get balance for specific account' })
  async getBalance(@Param('id') accountId: string, @Request() req) {
    const account = await this.accountsService.findById(accountId);
    
    // Verify account belongs to user
    if (account.userId.toString() !== req.user.userId) {
      throw new Error('Unauthorized');
    }

    return {
      accountId: account._id,
      currency: account.currency,
      balance: account.balance,
    };
  }
}
