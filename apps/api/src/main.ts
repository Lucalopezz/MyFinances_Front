import './vercel-module-paths';
import { PublicExceptionFilter } from './common/filters/public-exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new PublicExceptionFilter());
  // Permite ajustar categorias das 1000 linhas de importação mantendo um limite para o corpo da requisição.
  app.useBodyParser('json', { limit: '256kb' });
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Preview fica isolado enquanto DATABASE_URL ainda aponta para produção.
  // Habilite as demais rotas somente depois de configurar um banco de teste.
  if (
    process.env.VERCEL_ENV === 'preview' &&
    process.env.PREVIEW_API_ENABLED !== '1'
  ) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/health') return next();
      return res.status(503).json({
        message: 'API do Preview aguardando banco de teste separado.',
      });
    });
  }

  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
