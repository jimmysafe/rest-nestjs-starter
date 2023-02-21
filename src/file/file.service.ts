import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { FileUploadResponse } from './file.utils';

@Injectable()
export class FileService {
  constructor(private s3Service: S3Service) {}

  public uploadFileLocal(file: Express.Multer.File): FileUploadResponse {
    return {
      fileName: file.filename,
      url: file.path,
    };
  }

  public async uploadFileS3(
    file: Express.Multer.File,
  ): Promise<FileUploadResponse> {
    return this.s3Service.uploadFile(
      file,
      file.originalname.replace('.', `-${new Date().getTime()}.`),
    );
  }
}
