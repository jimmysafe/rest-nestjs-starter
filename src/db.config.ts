import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const dbConfig = (
  configService: ConfigService,
  config: {
    /**
     * Synchronise the connection?
     */
    synchronize?: boolean;
    /**
     * Log all operations?
     */
    logging?: boolean;
  },
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  name: 'default',
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  port: +(configService.get<number>('DB_PORT') ?? 5432),
  entities: [`${__dirname}/**/*.entity{.ts,.js}`, 'dist/**/*.entity.js'],
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  synchronize: config.synchronize ?? false,
  logging: config.logging,
});
