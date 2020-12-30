import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  // app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minutes
      max: 20, // limit each IP to 100 requests per windowMs
    }),
  );
  app.enableCors();

  const configService = app.get(ConfigService);

  await app.listen(configService.get('app.port'));
}
bootstrap();
