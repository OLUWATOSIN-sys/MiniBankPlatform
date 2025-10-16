import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { Currency } from '../../accounts/entities/account.entity';

export class TransferDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsNotEmpty()
  currency: Currency;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Payment for services', required: false })
  @IsString()
  description?: string;
}
