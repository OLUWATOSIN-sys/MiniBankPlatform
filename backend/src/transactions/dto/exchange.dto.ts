import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Currency } from '../../accounts/schemas/account.schema';

export class ExchangeDto {
  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsNotEmpty()
  fromCurrency: Currency;

  @ApiProperty({ enum: Currency, example: Currency.EUR })
  @IsNotEmpty()
  toCurrency: Currency;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
