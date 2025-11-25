import { Controller, Get, Post, Req, Res, UseGuards, BadRequestException, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Public } from '@/decorator/customize.decorator';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { RoleEnum } from '../roles/roles.enum';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18nService: I18nService<I18nTranslations>
  ) { }

  @Public()
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Get('logout')
  logout(@Req() req) {
    return this.authService.logout(req.user);
  }

  @Get('refresh')
  @Public()
  getRefreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const { refresh_token } = req.cookies
    return this.authService.processNewToken(refresh_token, response)
  }
}
