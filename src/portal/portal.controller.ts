import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { URL } from 'url';

@ApiExcludeController()
@Controller('portal')
export class PortalController {
  private domain: string;

  private clientId: string;

  private redirectUri: string;

  constructor(configService: ConfigService) {
    this.domain = configService.get('AMPLIFY_HOSTED_DOMAIN')!;
    this.clientId = configService.get('AMPLIFY_CLIENT_ID')!;
    this.redirectUri =
      configService.get('AMPLIFY_HOSTED_REDIRECT') ??
      'http://localhost:4000/public/auth/success';
  }

  @Get('url')
  async getPortalUrl() {
    const url = new URL(`${this.domain}/login`);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('response_type', 'token');
    url.searchParams.append('scope', 'email openid');

    return {
      url: `${url.toString()}&redirect_uri=${this.redirectUri}`,
    };
  }
}
