import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LedgerService } from './ledger.service';
import { Ledger, LedgerSchema } from './schemas/ledger.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ledger.name, schema: LedgerSchema }]),
  ],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
