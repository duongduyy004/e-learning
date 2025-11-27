import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { AuthFacebookService } from "./auth-facebook.service";
import { Public } from "decorator/customize.decorator";
import { FacebookLoginDto } from "./dto/facebook-login.dto";
import { AuthService } from "modules/auth/auth.service";
import { AuthProvidersEnum } from "modules/auth/auth-providers.enum";
import { Response } from "express";

@Controller('auth/facebook')
export class AuthFacebookController {
    constructor(
        private readonly authFacebookService: AuthFacebookService,
        private readonly authService: AuthService
    ) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginFacebook: FacebookLoginDto, @Res({ passthrough: true }) response: Response) {
        const socialData = await this.authFacebookService.getProfileByToken(loginFacebook)
        return this.authService.validateSocialLogin(AuthProvidersEnum.facebook, socialData, response);
    }
}