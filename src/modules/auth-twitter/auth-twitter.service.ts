import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { AllConfigType } from 'config/config.type';
import { Response } from 'express';
import { AuthService } from 'modules/auth/auth.service';
import { SocialInterface } from 'modules/social/social.interface';
import { UserMapper } from 'modules/users/user.mapper';
import { UsersService } from 'modules/users/users.service';
import { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class AuthTwitterService {
  constructor(
    private configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private authService: AuthService,
    private usersService: UsersService
  ) { }
  async login() {
    const clientId = this.configService.get('twitter.clientId', {
      infer: true,
    });
    const clientSecret = this.configService.get('twitter.clientSecret', {
      infer: true,
    });
    const callbackUrl = this.configService.get('twitter.callbackUrl', {
      infer: true,
    });
    const consumerClient = new TwitterApi({ clientId, clientSecret });

    const link = consumerClient.generateOAuth2AuthLink(callbackUrl, {
      scope: ['tweet.read', 'users.email', 'users.read', 'offline.access'],
    });
    const { state, codeVerifier, url } = link;
    await this.cacheManager.set(state, codeVerifier);
    return {
      state,
      url,
    };
  }

  async getProfile(code: string, state: string): Promise<SocialInterface> {
    const clientId = this.configService.get('twitter.clientId', {
      infer: true,
    });
    const clientSecret = this.configService.get('twitter.clientSecret', {
      infer: true,
    });
    const callbackUrl = this.configService.get('twitter.callbackUrl', {
      infer: true,
    });
    const client = new TwitterApi({ clientId, clientSecret });

    const codeVerifier = await this.cacheManager.get<string>(state);

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackUrl,
    });

    const { data: userProfile } = await loggedClient.v2.me({
      'user.fields': ['id', 'name', 'confirmed_email', 'profile_image_url'],
    });

    return {
      id: userProfile.id,
      email: userProfile.confirmed_email,
      name: userProfile.name,
      pictureUrl: userProfile.profile_image_url,
    };
  }

  async exchange(token: string, response: Response) {
    const userId = await this.cacheManager.get<string>(token);
    const user = await this.usersService.findUserById(parseInt(userId));

    const data = await this.authService.login(UserMapper.toDomain(user), response);

    return data
  }
}
