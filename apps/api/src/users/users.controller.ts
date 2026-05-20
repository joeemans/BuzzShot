import { Controller, Get } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { demoUsers } from '../demo-data.js';

@Controller('users')
export class UsersController {
  @Get()
  list() {
    return envelope(demoUsers);
  }
}
