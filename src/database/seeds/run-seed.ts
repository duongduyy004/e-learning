import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';

const runSeed = async () => {
    const app = await NestFactory.create(SeedModule);

    // run seeds in order
    console.log('Seeding roles...');
    await app.get(RoleSeedService).run();
};

void runSeed();
