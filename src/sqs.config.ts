import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SqsModuleOptionsFactory,
  SqsOptions,
} from '@ssut/nestjs-sqs/dist/sqs.types';
import { SQS } from 'aws-sdk';

@Injectable()
export class SqsConfig implements SqsModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createOptions(): SqsOptions {
    return {
      consumers: [
        {
          region: this.configService.get('SQS_REGION'),
          name: this.configService.get('SQS_USERS_QUEUE_NAME')!,
          queueUrl: this.configService.get('SQS_USERS_QUEUE_URL'),
          messageAttributeNames: ['All'],
          sqs: new SQS({
            region: this.configService.get('AWS_REGION'),
            credentials: {
              accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
              secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
            },
          }),
        },
      ],
    };
  }
}
