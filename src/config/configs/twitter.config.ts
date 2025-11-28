import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from '@/utils/validate-config';
import { TwitterConfig } from '../types/twitter-config.type';

class EnvironmentVariablesValidator {
    @IsString()
    TWITTER_CLIENT_ID: string;

    @IsString()
    TWITTER_CLIENT_SECRET: string;

    @IsString()
    TWITTER_CALL_BACK_URL: string;
}

export default registerAs<TwitterConfig>('twitter', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackUrl: process.env.TWITTER_CALL_BACK_URL,
    };
});
