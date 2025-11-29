import { Module } from '@nestjs/common';
import { UsersService } from 'modules/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { UsersController } from './user.controller';
import { FilesService } from 'modules/files/files.service';
import { RelationshipEntity } from './entities/relationship.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RelationshipEntity
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService, FilesService],
  exports: [UsersService]
})
export class UsersModule { }
