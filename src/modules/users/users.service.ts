import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleEnum } from 'modules/roles/roles.enum';
import { UserMapper } from './user.mapper';
import { User } from './user.domain';
import { FilesService } from 'modules/files/files.service';
import { FilterUsersDto, SortUsersDto } from './dto/query-users.dto';
import { IPaginationOptions } from 'utils/types/pagination-options';
import { PaginationResponseDto } from 'utils/types/pagination-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RelationshipEntity } from './entities/relationship.entity';
import { ChangePasswordDto } from './dto/change-pasword.dto';
import { NotificationsService } from 'modules/notifications/notifications.service';
import { ENTITY_TYPE } from 'modules/notifications/entity.type';

@Injectable()
export class UsersService {
  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RelationshipEntity)
    private relationshipRepository: Repository<RelationshipEntity>,
    private readonly filesService: FilesService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async isEmailExist(email: string): Promise<boolean> {
    return await this.userRepository.exists({
      where: { email },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  isValidPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    await this.isEmailExist(createUserDto.email);
    const newEntity = await this.userRepository.save(
      this.userRepository.create({
        ...createUserDto,
        role: { id: RoleEnum.admin },
      }),
    );
    return UserMapper.toDomain(newEntity);
  }

  async updateUserToken(user: any, refreshToken: string): Promise<void> {
    await this.userRepository.update({ id: user.id }, { refreshToken });
    return;
  }

  async findUserByToken(refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { refreshToken },
    });
    if (!user) return null;
    return user;
  }

  async uploadAvatar(
    imageUrl: string,
    publicId: string,
    user: User,
  ): Promise<void> {
    const roleId = user?.role?.id;

    const repositoryMap: Record<string, { repo: Repository<any> }> = {
      [RoleEnum.admin]: { repo: this.userRepository },
    };

    const config = repositoryMap[roleId];
    if (!config) return;

    const entity = await config.repo.findOne({ where: { id: user.id } });
    if (!entity) {
      throw new NotFoundException(this.i18nService.t('user.FAIL.NOT_FOUND'));
    }

    if (entity && entity.publicId && entity.avatar) {
      await this.filesService.deleteFile(entity.publicId);
      entity.avatar = null;
      entity.publicId = null;
    }

    if (roleId !== RoleEnum.admin && entity.avatar && entity.publicId) {
      throw new BadRequestException(
        'Avatar already exists. Please delete the current avatar before uploading a new one.',
      );
    }

    entity.avatar = imageUrl;
    entity.publicId = publicId;
    await config.repo.save(entity);
  }

  async findUserById(userId: User['id']) {
    const [user] = await Promise.all([
      this.userRepository.findOne({
        where: { id: userId },
        relations: ['role'],
      }),
    ]);

    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.userRepository.save(
      this.userRepository.create({
        ...createUserDto,
        role: { id: createUserDto.roleId || RoleEnum.user },
      }),
    );
  }

  async getUsers({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUsersDto;
    sortOptions?: SortUsersDto[];
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResponseDto<User>> {
    const where: FindOptionsWhere<UserEntity> = {};

    if (filterOptions?.name) {
      where.name = ILike(`%${filterOptions.name}%`);
    }

    const [entities, total] = await this.userRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      order: sortOptions?.reduce(
        (acc, s) => ({ ...acc, [s.orderBy]: s.order }),
        {},
      ),
    });

    const totalItems = total;
    const totalPages = Math.ceil(totalItems / paginationOptions.limit);

    return {
      meta: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        totalPages,
        totalItems,
      },
      result: entities.map(UserMapper.toDomain),
    };
  }

  async getUser(userId: User['id']) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('User not found');
    return UserMapper.toDomain(user);
  }

  async updateUser(userId: User['id'], updateUserDto: UpdateUserDto) {
    await this.userRepository.update({ id: userId }, updateUserDto);
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    return updatedUser;
  }

  async softDeleteUser(userId: User['id']) {
    return this.userRepository.softDelete({ id: userId });
  }

  async removeRefreshToken(userId: User['id']) {
    return await this.userRepository.update(
      { id: userId },
      { refreshToken: null },
    );
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    user.password = newPassword;
    return await this.userRepository.save(user);
  }

  async changePassword(userData: User, forgotPasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = forgotPasswordDto;
    const { email } = userData;

    const user = await this.userRepository.findOne({
      where: { email },
    });
    const { password } = user;
    const isValidPassword = await this.isValidPassword(
      currentPassword,
      password,
    );

    if (!isValidPassword)
      throw new BadRequestException('Current Password is Wrong!');

    if (newPassword !== confirmPassword)
      throw new BadRequestException('newPassword and confirm does not match');

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);

    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);
    return {
      result: 'Password changed successfully!',
    };
  }

  async findBySocialIdAndProvider(
    socialId: string,
    provider: string,
  ): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: {
        socialId,
        provider,
      },
    });
  }

  async followUser(user: User, userId: User['id']) {
    if (user.id === userId)
      throw new BadRequestException('You can not follow yourself');

    const following = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!following) throw new BadRequestException('User not found');

    const exists = await this.relationshipRepository.findOne({
      where: { follower: { id: user.id }, following: { id: userId } },
    });

    if (exists) throw new BadRequestException('Already following this user');

    const relationship = await this.relationshipRepository.save(
      this.relationshipRepository.create({ follower: user, following }),
    );

    // Trigger notification for following a user
    await this.notificationsService.createAndSendNotification(user, {
      entityTypeId: ENTITY_TYPE.FOLLOW.id,
      entityId: userId,
    });

    return {
      user,
      following: {
        id: relationship.following.id,
        name: relationship.following.name,
      },
    };
  }

  async unFollowUser(user: User, userId: User['id']) {
    const following = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!following) throw new BadRequestException('User not found');

    const exists = await this.relationshipRepository.findOne({
      where: { follower: { id: user.id }, following: { id: userId } },
    });

    if (!exists) throw new BadRequestException('You do not follow this user');

    return await this.relationshipRepository.delete({
      follower: { id: user.id },
      following: { id: userId },
    });
  }

  async getFollowingUsers(
    user: User,
    {
      filterOptions,
      sortOptions,
      paginationOptions,
    }: {
      filterOptions: FilterUsersDto;
      sortOptions: SortUsersDto[];
      paginationOptions: IPaginationOptions;
    },
  ) {
    const where: FindOptionsWhere<UserEntity> = {};

    if (filterOptions?.name) where.name = ILike(`%${filterOptions?.name}%`);

    const [followings, total] = await this.relationshipRepository.findAndCount({
      where: { follower: { id: user.id }, following: where },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: sortOptions?.reduce(
        (acc, s) => ({ ...acc, [s.orderBy]: s.order }),
        {},
      ),
      relations: ['following'],
    });

    const totalItems = total;
    const totalPages = Math.ceil(totalItems / paginationOptions.limit);

    return {
      user,
      meta: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        totalPages,
        totalItems,
      },
      result: followings.map((item) => ({
        id: item.following.id,
        name: item.following.name,
        avatar: item.following.avatar,
      })),
    };
  }

  async getFollowerUsers(
    user: User,
    {
      filterOptions,
      sortOptions,
      paginationOptions,
    }: {
      filterOptions: FilterUsersDto;
      sortOptions: SortUsersDto[];
      paginationOptions: IPaginationOptions;
    },
  ) {
    const where: FindOptionsWhere<UserEntity> = {};

    if (filterOptions?.name) where.name = ILike(`%${filterOptions?.name}%`);

    const [followers, total] = await this.relationshipRepository.findAndCount({
      where: { following: { id: user.id }, follower: where },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: sortOptions?.reduce(
        (acc, s) => ({ ...acc, [s.orderBy]: s.order }),
        {},
      ),
      relations: ['follower'],
    });

    const totalItems = total;
    const totalPages = Math.ceil(totalItems / paginationOptions.limit);

    return {
      user,
      meta: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        totalPages,
        totalItems,
      },
      result: followers.map((item) => ({
        id: item.follower.id,
        name: item.follower.name,
        avatar: item.follower.avatar,
      })),
    };
  }
}
