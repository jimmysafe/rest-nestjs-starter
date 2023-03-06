import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  name: 'default',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: +(process.env.DB_PORT ?? 5432),
  entities: [`dist/**/*.entity.js`],
  migrations: [`dist/db/migrations/*.js`],
  synchronize: true,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
