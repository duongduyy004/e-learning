import { Module } from '@nestjs/common';
import { AuthTwitterController } from './auth-twitter.controller';
import { AuthTwitterService } from './auth-twitter.service';
import { AuthModule } from 'modules/auth/auth.module';
import { UsersModule } from 'modules/users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AuthTwitterController],
  providers: [AuthTwitterService],
})
export class AuthTwitterModule { }
