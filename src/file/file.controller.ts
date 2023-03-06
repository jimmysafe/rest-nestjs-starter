import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorators';
import { UserRole } from 'src/user/user.entity';
import { FileService } from './file.service';
import { ApiFile, FileUploadResponse, localMulterOptions } from './file.utils';

@Controller('file')
@ApiTags('File')
export class FileController {
  constructor(private fileService: FileService) {}

  @Auth(UserRole.USER)
  @UseInterceptors(FileInterceptor('file', localMulterOptions))
  @Post('/local/upload')
  @ApiFile()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ type: FileUploadResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async uploadLocal(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileUploadResponse> {
    return this.fileService.uploadFileLocal(file);
  }

  @Auth(UserRole.USER)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/s3/upload')
  @ApiFile()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ type: FileUploadResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async uploadS3(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileUploadResponse> {
    return this.fileService.uploadFileS3(file);
  }
}
