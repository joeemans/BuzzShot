import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { demoLists } from '../demo-data.js';

@Controller('lists')
export class ListsController {
  @Get()
  list() {
    return envelope(demoLists);
  }

  @Get(':listId')
  detail(@Param('listId') listId: string) {
    const list = demoLists.find((item) => item.id === listId);
    if (!list) throw new NotFoundException('List not found.');
    return envelope(list);
  }

  @Post()
  create(@Body() body: unknown) {
    return envelope({ accepted: true, list: body });
  }
}
