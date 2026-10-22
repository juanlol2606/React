import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
// import { Auth } from 'src/auth/decorators';
// import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @ApiResponse({
    status: 200,
    description: 'Seed executed',
  })
  @Get()
  // @Auth(ValidRoles.admin, ValidRoles.superUser)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
