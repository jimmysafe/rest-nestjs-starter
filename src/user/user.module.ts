import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserHandler } from './user.handler';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserHandler],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
