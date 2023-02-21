import { ApiBody, ApiProperty } from '@nestjs/swagger';
import * as multer from 'multer';

export class FileUploadResponse {
  @ApiProperty()
  fileName: string;
  @ApiProperty()
  url: string;
}

export const localMulterOptions = {
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (_, file, cb) => {
      cb(null, file.originalname.replace('.', `-${new Date().getTime()}.`));
    },
  }),
};

/** Decorator */
export const ApiFile =
  (fileName = 'file'): MethodDecorator =>
  (target: any, propertyKey: any, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
