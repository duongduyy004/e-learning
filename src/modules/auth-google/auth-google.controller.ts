import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { Public } from 'decorator/customize.decorator';
import { AuthService } from 'modules/auth/auth.service';
import { AuthProvidersEnum } from 'modules/auth/auth-providers.enum';
import { Response } from 'express';

@Controller('auth/google')
export class AuthGoogleController {
  constructor(
    private readonly authGoogleService: AuthGoogleService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const socialData = await this.authGoogleService.getProfileByToken(loginDto);
    return this.authService.validateSocialLogin(
      AuthProvidersEnum.google,
      socialData,
      response,
    );
  }
}
