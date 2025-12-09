import { Controller, Get, Inject, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Public } from 'decorator/customize.decorator';
import { AuthTwitterService } from './auth-twitter.service';
import { Response } from 'express';
import { AuthService } from 'modules/auth/auth.service';
import { AuthProvidersEnum } from 'modules/auth/auth-providers.enum';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'config/config.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('auth/twitter')
export class AuthTwitterController {
  constructor(
    private authTwitterService: AuthTwitterService,
    private authService: AuthService,
    private configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  @Public()
  @Post('login')
  login() {
    return this.authTwitterService.login();
  }

  @Public()
  @Get('callback')
  async callBackAuth(@Query() query: any, @Res() res: Response) {
    const frontendDomain = this.configService.get('app.frontendDomain', { infer: true })
    const { code, state } = query;
    const socialData = await this.authTwitterService.getProfile(code, state);
    const data = await this.authService.validateSocialLogin(
      AuthProvidersEnum.twitter,
      socialData,
      res,
    );
    await this.cacheManager.set(data.access_token, data.user.id, 30 * 1000);
    const url = new URL(frontendDomain)
    url.searchParams.set('token', data.access_token)
    return res.redirect(url.toString());
  }

  @Public()
  @Get('exchange')
  exchange(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authTwitterService.exchange(token, res);
  }
}
