import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdParams {
  @ApiProperty()
  @IsString()
  id: string;
}
