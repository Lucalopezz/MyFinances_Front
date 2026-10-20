import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { User } from 'src/common/decorators/get-userId-from-token.decorator';
import { AuthTokenGuard } from 'src/common/guards/auth-token.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateTransactionExportDto,
  CreateTransactionExportSchema,
} from './dto/create-transaction-export.dto';
import { DirectTransactionExportService } from './services/direct-transaction-export.service';

@Controller('exports/transactions')
@UseGuards(AuthTokenGuard)
export class DirectExportsController {
  constructor(private readonly exports: DirectTransactionExportService) {}

  /** O token define o proprietário; filtros e formato passam pela validação existente. */
  @Post('direct')
  @HttpCode(HttpStatus.OK)
  async download(
    @Body(new ZodValidationPipe(CreateTransactionExportSchema))
    filters: CreateTransactionExportDto,
    @User('sub') userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const result = await this.exports.generate(userId, filters);
    const stream = createReadStream(result.filePath);
    // O diretório temporário precisa sobreviver até a última leitura do stream.
    stream.once('close', () => void result.cleanup());
    response.once('close', () => stream.destroy());
    return new StreamableFile(stream, {
      type: result.contentType,
      disposition: `attachment; filename="${result.fileName}"`,
      length: result.size,
    });
  }
}
