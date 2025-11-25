import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleEnum } from 'modules/roles/roles.enum';
import { UserMapper } from './user.mapper';
import { User } from './user.domain';
import { FilesService } from 'modules/files/files.service';

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

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email }
    })
    return UserMapper.toDomain(user);
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
    const roleId = user.role?.id;

    const updateMap: Record<string, Repository<any>> = {
      [RoleEnum.admin]: this.userRepository
    };

    const repository = updateMap[roleId];
    if (repository) {
      await repository.update({ id: user.id }, { refreshToken });
    }
  }

  async findUserByToken(refreshToken: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { refreshToken }
    })
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
}
