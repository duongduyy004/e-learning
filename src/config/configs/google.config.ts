import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from '@/utils/validate-config';
import { GoogleConfig } from '../types/google-config.type';

class EnvironmentVariablesValidator {
    @IsString()
    GOOGLE_CLIENT_ID: string;

    @IsString()
    GOOGLE_SECRET: string;
}

export default registerAs<GoogleConfig>('google', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
    };
});
