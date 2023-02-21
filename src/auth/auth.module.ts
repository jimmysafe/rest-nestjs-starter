import { Module } from '@nestjs/common';
import { JWTStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, HttpModule, JwtModule.register({})],
  providers: [AuthService, JWTStrategy],
})
export class AuthModule {}
