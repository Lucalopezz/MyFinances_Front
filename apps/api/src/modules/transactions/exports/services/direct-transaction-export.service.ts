import { Injectable } from '@nestjs/common';
import { TransactionExportFormat } from '@prisma/client';
import { createWriteStream } from 'fs';
import { mkdtemp, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { finished } from 'stream/promises';
import { CategoriesService } from '../../../categories/categories.service';
import { TRANSACTION_EXPORT_FILE_TYPES } from '../constants/transaction-export.formats';
import { CreateTransactionExportDto } from '../dto/create-transaction-export.dto';
import { transactionExportFilename } from '../helpers/transaction-export-filename.helper';
import { TransactionExportReaderService } from './transaction-export-reader.service';
import { TransactionExportWriterFactory } from './transaction-export-writer.factory';
import { TransactionExportWriter } from '../types/transaction-export-writer.types';

@Injectable()
export class DirectTransactionExportService {
  constructor(
    private readonly categories: CategoriesService,
    private readonly reader: TransactionExportReaderService,
    private readonly writers: TransactionExportWriterFactory,
  ) {}

  /** Gera e entrega o arquivo na mesma requisição, sem Redis ou disco compartilhado. */
  async generate(userId: string, filters: CreateTransactionExportDto) {
    if (filters.categoryId) {
      await this.categories.resolveReference(
        filters.categoryId,
        userId,
        filters.type,
        true,
      );
    }

    const catalog = await this.categories.list(userId);
    const { format, ...transactionFilters } = filters;
    const { extension, contentType } =
      TRANSACTION_EXPORT_FILE_TYPES[format as TransactionExportFormat];
    // Cada invocação recebe um diretório próprio em /tmp. O arquivo só existe
    // até o término do download e nunca precisa ser encontrado por outra função.
    const directory = await mkdtemp(join(tmpdir(), 'myfinances-export-'));
    const filePath = join(directory, `transactions.${extension}`);
    const output = createWriteStream(filePath);
    const outputFinished = finished(output);
    outputFinished.catch(() => undefined);
    let writer: TransactionExportWriter | undefined;

    try {
      writer = await this.writers.create(format, output, filters, catalog);
      await this.reader.writeTransactions(
        userId,
        filters,
        writer,
        async () => undefined,
      );
      // O PDF, CSV ou ZIP XLSX só pode ser entregue depois que a escrita
      // física termina; uma falha gera erro HTTP em vez de arquivo parcial.
      await Promise.all([writer.finalize(), outputFinished]);
      const { size } = await stat(filePath);
      return {
        filePath,
        fileName: transactionExportFilename(
          extension,
          new Date(),
          transactionFilters,
        ),
        contentType,
        size,
        cleanup: () => rm(directory, { recursive: true, force: true }),
      };
    } catch (error) {
      writer?.abort();
      output.destroy();
      await outputFinished.catch(() => undefined);
      await rm(directory, { recursive: true, force: true });
      throw error;
    }
  }
}
