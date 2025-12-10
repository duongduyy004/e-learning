import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserInfo } from '@/decorator/customize.decorator';
import { User } from './user.domain';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { QueryDto } from 'utils/types/query.dto';
import { FilterUsersDto, SortUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-pasword.dto';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('admin')
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAdmin(createUserDto);
  }

  @Get()
  getUsers(@Query() queryDto: QueryDto<FilterUsersDto, SortUsersDto>) {
    return this.usersService.getUsers({
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        limit: queryDto.limit,
        page: queryDto.page,
      },
    });
  }

  @Patch('change-password')
  changePassword(
    @UserInfo() user: User,
    @Body() fogorPasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user, fogorPasswordDto);
  }

  @Get('following')
  getFollowingUsers(
    @UserInfo() user: User,
    @Query() queryDto: QueryDto<FilterUsersDto, SortUsersDto>,
  ) {
    return this.usersService.getFollowingUsers(user, {
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        limit: queryDto.limit,
        page: queryDto.page,
      },
    });
  }

  @Get('follower')
  getFollowerUsers(
    @UserInfo() user: User,
    @Query() queryDto: QueryDto<FilterUsersDto, SortUsersDto>,
  ) {
    return this.usersService.getFollowerUsers(user, {
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        limit: queryDto.limit,
        page: queryDto.page,
      },
    });
  }

  @Get(':userId')
  getUserById(@Param('userId') userId: User['id']) {
    return this.usersService.getUser(userId);
  }

  @Patch('avatar')
  uploadAvatar(
    @Body() uploadavatarDto: UploadAvatarDto,
    @UserInfo() user: User,
  ) {
    return this.usersService.uploadAvatar(
      uploadavatarDto.imageUrl,
      uploadavatarDto.publicId,
      user,
    );
  }
  @Patch(':userId')
  updateUser(
    @Param('userId') userId: User['id'],
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Delete(':userId')
  softDeleteUser(@Param('userId') userId: User['id']) {
    return this.usersService.softDeleteUser(userId);
  }

  @Patch('follow/:userId')
  followUser(@UserInfo() user: User, @Param('userId') userId: User['id']) {
    return this.usersService.followUser(user, +userId);
  }

  @Patch('unfollow/:userId')
  unFollowUser(@UserInfo() user: User, @Param('userId') userId: User['id']) {
    return this.usersService.unFollowUser(user, +userId);
  }
}
