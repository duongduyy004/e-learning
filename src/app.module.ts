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
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig,
        jwtConfig,
        cloudinaryConfig,
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
    UsersModule,
    AuthModule,
    FilesModule,
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    },
  ],
})
export class AppModule { }
