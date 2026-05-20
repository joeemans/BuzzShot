import { Controller, Get } from '@nestjs/common';
import { envelope } from '../common/http.js';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return envelope({
      ok: true,
      service: 'buzzshot-api',
      timestamp: new Date().toISOString(),
    });
  }
}
