import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@/database/typeorm-config.service';
import { UsersModule } from 'modules/users/users.module';
import databaseConfig from '@/config/configs/database.config';
import appConfig from '@/config/configs/app.config';
import jwtConfig from '@/config/configs/jwt.config';
import cloudinaryConfig from '@/config/configs/cloudinary.config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from '@/core/transform.interceptor';
import { AuthModule } from 'modules/auth/auth.module';
import * as path from 'path';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@/logger/logger.config';
import { HttpLoggerInterceptor } from './core/logger.interceptor';
import { ClsModule } from 'nestjs-cls';
import { FilesModule } from './modules/files/files.module';
import { RolesGuard } from 'modules/roles/roles.guard';
import { DataSource } from 'typeorm';
import mailerConfig from 'config/configs/mailer.config';
import { MailerModule } from 'modules/mailer/mailer.module';
import { MailModule } from 'modules/mail/mail.module';
import { AuthGoogleModule } from 'modules/auth-google/auth-google.module';
import googleConfig from 'config/configs/google.config';
import { AuthFacebookModule } from 'modules/auth-facebook/auth-facebook.module';
import { HttpModule } from '@nestjs/axios';
import { AuthTwitterModule } from 'modules/auth-twitter/auth-twitter.module';
import twitterConfig from 'config/configs/twitter.config';
import { CacheModule } from '@nestjs/cache-manager';
import { CategoryModule } from './modules/categories/category.module';
import { WordsModule } from 'modules/words/words.module';
import { QuestionsModule } from 'modules/questions/questions.module';
import { ResultsModule } from 'modules/results/results.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig,
        jwtConfig,
        cloudinaryConfig,
        mailerConfig,
        googleConfig,
        twitterConfig
      ],
      envFilePath: ['.env'],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src', 'i18n'),
        watch: true,
      },
      typesOutputPath: path.join(
        process.cwd(),
        'src',
        'generated',
        'i18n.generated.ts',
      ),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['x-lang'] },
        AcceptLanguageResolver,
      ],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize()
        return dataSource;
      }
    }),
    WinstonModule.forRoot(winstonConfig),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      global: true
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30 * 1000
    }),
    UsersModule,
    AuthModule,
    AuthGoogleModule,
    AuthFacebookModule,
    AuthTwitterModule,
    FilesModule,
    MailerModule,
    MailModule,
    CategoryModule,
    WordsModule,
    QuestionsModule,
    ResultsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    },
  ],
})
export class AppModule { }
