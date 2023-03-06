import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class PostFilterDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  readonly userId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly content?: string;
}
