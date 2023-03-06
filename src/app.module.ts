import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SqsConfig } from './sqs.config';
import { PortalController } from './portal/portal.controller';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { S3Module } from './s3/s3.module';
import { FileModule } from './file/file.module';
import { dataSourceOptions } from 'db/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useClass: SqsConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    PostModule,
    UserModule,
    AuthModule,
    S3Module,
    FileModule,
  ],
  controllers: [PortalController],
  providers: [],
})
export class AppModule {}
