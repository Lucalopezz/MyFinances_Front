import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { CategoriesModule } from '../../categories/categories.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { TRANSACTION_EXPORT_QUEUE } from './constants/exports.constants';
import { ExportsController } from './exports.controller';
import { ExportsService } from './services/exports.service';
import { TransactionExportProcessor } from './processors/transaction-export.processor';
import { TransactionPdfService } from './generators/pdf/transaction-pdf.service';
import { TransactionCsvService } from './generators/csv/transaction-csv.service';
import { TransactionXlsxService } from './generators/xlsx/transaction-xlsx.service';
import { TransactionExportsRepository } from './repositories/transaction-exports.repository';
import { TransactionsModule } from '../transactions.module';
import { TransactionExportReaderService } from './services/transaction-export-reader.service';
import { TransactionExportWriterFactory } from './services/transaction-export-writer.factory';
import { exportsAvailable } from '../../../common/config/deployment-features';
import { DirectExportsController } from './direct-exports.controller';
import { DirectTransactionExportService } from './services/direct-transaction-export.service';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    AuthModule,
    TransactionsModule,
    // O modo direto não cria conexões Redis na função HTTP da Vercel.
    ...(exportsAvailable()
      ? [BullModule.registerQueue({ name: TRANSACTION_EXPORT_QUEUE })]
      : []),
  ],
  controllers: [
    DirectExportsController,
    ...(exportsAvailable() ? [ExportsController] : []),
  ],
  providers: [
    DirectTransactionExportService,
    ...(exportsAvailable()
      ? [
          ExportsService,
          TransactionExportsRepository,
          TransactionExportProcessor,
        ]
      : []),
    TransactionPdfService,
    TransactionCsvService,
    TransactionXlsxService,
    TransactionExportReaderService,
    TransactionExportWriterFactory,
  ],
})
export class ExportsModule {}
