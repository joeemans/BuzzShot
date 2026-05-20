import { Controller, Get, Inject } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { TmdbService } from './tmdb.service.js';

@Controller('tmdb')
export class TmdbController {
  constructor(@Inject(TmdbService) private readonly tmdb: TmdbService) {}

  @Get('configuration')
  async configuration() {
    return envelope(await this.tmdb.configuration());
  }

  @Get('genres')
  async genres() {
    return envelope(await this.tmdb.genres());
  }
}
