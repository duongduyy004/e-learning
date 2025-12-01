import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Public } from 'decorator/customize.decorator';
import { AuthTwitterService } from './auth-twitter.service';
import { Response } from 'express';
import { AuthService } from 'modules/auth/auth.service';
import { AuthProvidersEnum } from 'modules/auth/auth-providers.enum';

@Controller('auth/twitter')
export class AuthTwitterController {
  constructor(
    private authTwitterService: AuthTwitterService,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('login')
  login() {
    return this.authTwitterService.login();
  }

  @Public()
  @Get('callback')
  async callBackAuth(@Query() query: any, @Res() res: Response) {
    const { code, state } = query;
    const socialData = await this.authTwitterService.getProfile(code, state);
    const data = this.authService.validateSocialLogin(
      AuthProvidersEnum.twitter,
      socialData,
      res,
    );
    return;
  }
}
