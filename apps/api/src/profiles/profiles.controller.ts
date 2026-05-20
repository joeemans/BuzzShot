import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { demoProfiles } from '../demo-data.js';

@Controller('profiles')
export class ProfilesController {
  @Get(':username')
  detail(@Param('username') username: string) {
    const profile = demoProfiles.find((item) => item.username === username);
    if (!profile) throw new NotFoundException('Profile not found.');
    return envelope(profile);
  }
}
