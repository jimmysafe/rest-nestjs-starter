import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadResponse } from 'src/file/file.utils';

@Injectable()
export class S3Service {
  private region: string;
  private bucket: string;
  private s3: S3Client;
  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET') || '';
    this.region = this.configService.get<string>('AWS_REGION') || '';
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Uploads a single file to S3
   * @param file the file to upload
   * @param key unique file identifier - needed to S3
   */
  public async uploadFile(
    file: Express.Multer.File,
    key: string,
  ): Promise<FileUploadResponse> {
    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const res = await this.s3.send(new PutObjectCommand(input));
      if (res.$metadata.httpStatusCode !== 200)
        throw new Error('File NOT saved to S3.');

      return {
        fileName: key,
        url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
