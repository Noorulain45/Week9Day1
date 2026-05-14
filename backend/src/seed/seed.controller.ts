import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  async run() {
    console.log('🔥 SEED ROUTE HIT');
    await this.seedService.seed();
    return { message: 'Seeding done' };
  }
}