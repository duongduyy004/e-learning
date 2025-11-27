import { DatabaseConfig } from './types/database-config.type';
import { AppConfig } from './types/app-config.type';
import { JwtConfig } from './types/jwt-config.type';
import { CloudinaryConfig } from './types/cloudinary-config.type';
import { MailerConfig } from './types/mailer-config.type';
import { GoogleConfig } from './types/google-config.type';

export type AllConfigType = {
    app: AppConfig;
    database: DatabaseConfig;
    jwt: JwtConfig;
    cloudinary: CloudinaryConfig,
    mailer: MailerConfig,
    google: GoogleConfig
};
