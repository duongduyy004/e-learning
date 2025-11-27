import {
    HttpStatus,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'config/config.type';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login.dto';
import { SocialInterface } from 'modules/social/social.interface';

@Injectable()
export class AuthGoogleService {
    private google: OAuth2Client;

    constructor(private configService: ConfigService<AllConfigType>) {
        this.google = new OAuth2Client(
            configService.get('google.clientId', { infer: true }),
            configService.get('google.clientSecret', { infer: true }),
        );
    }

    async getProfileByToken(
        loginDto: GoogleLoginDto,
    ): Promise<SocialInterface> {
        try {
            const ticket = await this.google.verifyIdToken({
                idToken: loginDto.idToken,
                audience: [
                    this.configService.getOrThrow('google.clientId', { infer: true }),
                ],
            });

            const data = ticket.getPayload();

            if (!data) {
                throw new UnprocessableEntityException({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'wrongToken',
                    },
                });
            }

            return {
                id: data.sub,
                email: data.email,
                name: data.given_name + ' ' + data.family_name
            };
        } catch (error) {
            throw new UnprocessableEntityException('Google token expired')
        }
    }
}