import { Module } from '@nestjs/common';
import { AuthTwitterController } from './auth-twitter.controller';
import { AuthTwitterService } from './auth-twitter.service';
import { AuthModule } from 'modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AuthTwitterController],
  providers: [AuthTwitterService],
})
export class AuthTwitterModule {}
