import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cognome?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  telefono?: string;
}
