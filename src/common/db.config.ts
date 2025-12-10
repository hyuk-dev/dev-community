import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { TypeOrmCustomLogger } from './typeorm-logger';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    schema: configService.get('DB_SCHEMA'),
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
    logger: new TypeOrmCustomLogger(),
    ssl: { rejectUnauthorized: false }
  }),
};
