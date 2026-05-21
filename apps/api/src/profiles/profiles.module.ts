import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ProfilesController } from './profiles.controller.js';

@Module({
  imports: [DatabaseModule],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
