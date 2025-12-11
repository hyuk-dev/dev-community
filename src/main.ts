import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './common/logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 값 자동제거
      forbidNonWhitelisted: true, // 정의되지 않은 값 에러 처리
      transform: true, // 요청 값을 DTO 클래스로 자동 변환
      transformOptions: {
        enableImplicitConversion: true // 문자열 -> 숫자 등 자동 변환
      }
    })
  )
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
