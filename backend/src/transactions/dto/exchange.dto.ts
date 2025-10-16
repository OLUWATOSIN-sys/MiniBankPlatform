import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Currency } from '../../accounts/entities/account.entity';

export class ExchangeDto {
  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsEnum(Currency)
  fromCurrency: Currency;

  @ApiProperty({ enum: Currency, example: Currency.EUR })
  @IsNotEmpty()
  toCurrency: Currency;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
