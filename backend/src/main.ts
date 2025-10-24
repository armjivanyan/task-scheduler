
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const origin = process.env.FRONTEND_ORIGIN?.split(',').map(s => s.trim());
  app.use(express.json());
  app.enableCors({ origin, credentials: true, methods: ['GET','POST','PATCH','DELETE'] });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
  app.use((req, res, next) => {
    const len = parseInt(req.headers['content-length'] as string) || 0;
    if (len > 1_000_000) return res.status(413).send('Payload too large');
    next();
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();