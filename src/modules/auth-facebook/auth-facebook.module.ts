import { Module } from '@nestjs/common';
import { AuthFacebookController } from './auth-facebook.controller';
import { AuthFacebookService } from './auth-facebook.service';
import { AuthModule } from 'modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AuthFacebookController],
  providers: [AuthFacebookService],
})
export class AuthFacebookModule {}
