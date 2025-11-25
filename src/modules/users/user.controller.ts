import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserInfo } from "@/decorator/customize.decorator";
import { User } from "./user.domain";
import { UploadAvatarDto } from "./dto/upload-avatar.dto";
import { QueryDto } from "utils/types/query.dto";
import { FilterUsersDto, SortUsersDto } from "./dto/query-users.dto";

@Controller('user')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @Get()
    getUsers(@Query() queryDto: QueryDto<FilterUsersDto, SortUsersDto>) {
        return this.usersService.getUsers({
            filterOptions: queryDto.filters,
            sortOptions: queryDto.sort,
            paginationOptions: {
                limit: queryDto.limit,
                page: queryDto.page
            }
        })
    }

    @Patch('avatar')
    uploadAvatar(@Body() uploadavatarDto: UploadAvatarDto, @UserInfo() user: User) {
        return this.usersService.uploadAvatar(uploadavatarDto.imageUrl, uploadavatarDto.publicId, user);
    }
}