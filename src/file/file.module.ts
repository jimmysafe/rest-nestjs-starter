import { Module } from '@nestjs/common';
import { S3Module } from 'src/s3/s3.module';
import { FileService } from './file.service';
import { FileController } from './file.controller';

@Module({
  imports: [S3Module],
  providers: [FileService],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
