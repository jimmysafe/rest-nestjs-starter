import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwkToPem, { JWK } from 'jwk-to-pem';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  private jwk: {
    keys: ({
      alg: string;
      e: string;
      kid: string;
      n: string;
    } & JWK)[];
  };

  constructor(
    private readonly authService: AuthService,
    httpService: HttpService,
    configService: ConfigService,
    jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Get config from token service
      secretOrKeyProvider: async (
        _: Request,
        token: string,
        done: (error: unknown | null, key?: string) => void,
      ) => {
        try {
          const jwkUrl = `${configService.get(
            'AMPLIFY_TOKEN_ISSUER',
          )}/.well-known/jwks.json`;

          const res = await lastValueFrom(httpService.get(jwkUrl));

          this.jwk = res.data;

          let kid = '';
          try {
            const payload = jwtService.decode(token, {
              complete: true,
            });
            if (!payload || typeof payload !== 'object')
              throw new Error('Unable to decode JWT token');

            kid = payload.header?.kid;
          } catch (err) {
            console.error('Unable to extract JWT kid', { err });
          }

          const key = this.jwk.keys.find((key) => key.kid === kid);

          if (!key) {
            console.error('JWK key not found', { kid });
            return done(new Error('JWK key not found'));
          }

          let pem = '';
          try {
            pem = jwkToPem(key);
          } catch (err) {
            console.error('Malformed or non-existend JWK', err);
            return done(err);
          }

          return done(null, pem);
        } catch (err) {
          console.log(err);
        }
      },
      issuer: configService.get('AMPLIFY_TOKEN_ISSUER'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const { sub } = payload;
    if (!sub) return null;
    return this.authService.validateUser(sub);
  }
}
