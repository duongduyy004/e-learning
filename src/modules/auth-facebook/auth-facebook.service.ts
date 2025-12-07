import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { AxiosError } from 'axios';
import { SocialInterface } from 'modules/social/social.interface';

@Injectable()
export class AuthFacebookService {
  constructor(private httpService: HttpService) {}
  async getProfileByToken(
    loginFacebook: FacebookLoginDto,
  ): Promise<SocialInterface> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<IFacebookResponse>(
            `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${loginFacebook.access_token}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.log(error);
              throw error;
            }),
          ),
      );
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        pictureUrl: data.picture.data.url,
      };
    } catch (error) {
      throw error;
    }
  }
}
