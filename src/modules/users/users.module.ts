import { Module } from '@nestjs/common';
import { UsersService } from 'modules/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { UsersController } from './user.controller';
import { FilesService } from 'modules/files/files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService, FilesService],
  exports: [UsersService]
})
export class UsersModule { }
