import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { User } from '../users/user.domain';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { Response } from 'express';
import { SignUpDto } from './dto/sign-up.dto';
import { MailService } from 'modules/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private i18nService: I18nService<I18nTranslations>,
    private configService: ConfigService<AllConfigType>,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    const isValid = this.usersService.isValidPassword(
      pass,
      user?.password || '',
    );
    if (isValid) return user;
    return null;
  }

  async signUp(signupDto: SignUpDto) {
    return this.usersService.createUser({
      email: signupDto.email,
      name: signupDto.name,
      password: signupDto.password,
      dayOfBirth: signupDto.dayOfBirth,
      gender: signupDto.gender,
    });
  }

  async logout(user: User) {
    return await this.usersService.removeRefreshToken(user.id);
  }

  async login(user: User, response: Response) {
    const { id, name, email, role, gender, dayOfBirth, avatar, publicId } =
      user;
    const payload = {
      sub: 'token login',
      iss: 'server',
      id,
      name,
      email,
      role,
    };

    const refreshToken = this.createRefreshToken(payload);
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 2592000 * 1000,
    });

    await this.usersService.updateUserToken(user, refreshToken);

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.jwt_access_secret', {
          infer: true,
        }),
        expiresIn: this.configService.get('jwt.jwt_access_expiration_minutes', {
          infer: true,
        }),
      }),
      user: {
        id,
        name,
        email,
        role,
        gender,
        dayOfBirth,
        avatar,
        publicId,
      },
    };
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.jwt_refresh_secret', { infer: true }),
      expiresIn: this.configService.get('jwt.jwt_refresh_expiration_days', {
        infer: true,
      }),
    });
    return refresh_token;
  };

  async processNewToken(refreshToken: string, response: Response) {
    try {
      const user = await this.usersService.findUserByToken(refreshToken);

      if (user) {
        const { id, name, email, role, gender, dayOfBirth } = user;
        const payload = {
          sub: 'token login',
          iss: 'server',
          id,
          name,
          email,
          role,
        };

        //save refresh token database
        const refresh_token = this.createRefreshToken(payload);
        this.usersService.updateUserToken(user, refresh_token);
        response.clearCookie('refresh_token');
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: 2592000 * 1000,
        });

        return {
          access_token: this.jwtService.sign(payload, {
            secret: this.configService.get('jwt.jwt_access_secret', {
              infer: true,
            }),
            expiresIn: this.configService.get(
              'jwt.jwt_access_expiration_minutes',
              { infer: true },
            ),
          }),
          user: {
            id,
            name,
            email,
            role,
            gender,
            dayOfBirth,
          },
        };
      } else {
        throw new NotFoundException(
          this.i18nService.t('common.NOT_FOUND', {
            args: {
              entity: 'user',
            },
          }),
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendVerifyEmail(user: User) {
    const token = this.jwtService.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      {
        secret: this.configService.get('jwt.jwt_confirm_email_secret', {
          infer: true,
        }),
        expiresIn: this.configService.get(
          'jwt.jwt_verify_email_expiration_minutes',
          { infer: true },
        ),
      },
    );
    return this.mailService.verifyEmail({
      to: user.email,
      data: { token },
    });
  }

  async verifyEmail(token: string) {
    try {
      const isValidToken = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.jwt_confirm_email_secret', {
          infer: true,
        }),
      });
      const userData = this.jwtService.decode(token);

      const { id, email } = userData;

      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'userNotFound',
          },
        });
      }
      // Change status of isEmailVerified
      user.isEmailVerified = true;
      const updatedUser = await this.usersService.updateUser(id, user);

      if (!isValidToken) return false;

      return { user: updatedUser, result: 'valid token' };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
