import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private readonly filesService: FilesService
  ) { }

  async isEmailExist(email: string): Promise<boolean> {
    return await this.userRepository.exists({
      where: { email }
    })
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email }
    })
    return user
  }

  isValidPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    await this.isEmailExist(createUserDto.email);
    const newEntity = await this.userRepository.save(
      this.userRepository.create({ ...createUserDto, role: { id: RoleEnum.admin } })
    );
    return UserMapper.toDomain(newEntity);
  }

  async updateUserToken(user: any, refreshToken: string): Promise<void> {
    await this.userRepository.update({ id: user.id }, { refreshToken });
    return;
  }

  async findUserByToken(refreshToken: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { refreshToken }
    })
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async uploadAvatar(imageUrl: string, publicId: string, user: User): Promise<void> {
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
      entity.publicId = null
    }

    if (roleId !== RoleEnum.admin && entity.avatar && entity.publicId) {
      throw new BadRequestException('Avatar already exists. Please delete the current avatar before uploading a new one.');
    }

    entity.avatar = imageUrl;
    entity.publicId = publicId;
    await config.repo.save(entity);
  }

  async findUserById(userId: User['id']) {
    const [user] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId }, relations: ['role'] }),
    ]);

    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.userRepository.save(
      this.userRepository.create({ ...createUserDto, role: { id: createUserDto.roleId } })
    )
  }

  async getUsers({
    filterOptions,
    sortOptions,
    paginationOptions
  }:
    {
      filterOptions?: FilterUsersDto,
      sortOptions?: SortUsersDto[],
      paginationOptions: IPaginationOptions
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
      where: { id: userId }
    })
    if (!user) throw new BadRequestException('User not found')
    return UserMapper.toDomain(user);
  }

  async updateUser(userId: User['id'], updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update({ id: userId }, updateUserDto);
    return result
  }

  async softDeleteUser(userId: User['id']) {
    return this.userRepository.softDelete({ id: userId })
  }


  async removeRefreshToken(userId: User['id']) {
    return await this.userRepository.update({ id: userId }, { refreshToken: null })
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    user.password = newPassword
    return await this.userRepository.save(user)
  }

  async findBySocialIdAndProvider(socialId: string, provider: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: {
        socialId,
        provider
      }
    })
  }
}
