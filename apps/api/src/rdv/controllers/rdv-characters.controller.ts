import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { RdvCharactersService } from '../services/rdv-characters.service';
import { CreateCharacterDto, UpdateCharacterDto } from '../dto';

@Controller('rdv/characters')
export class RdvCharactersController {
  constructor(private readonly charactersService: RdvCharactersService) {}

  @Post()
  async create(@Body() dto: CreateCharacterDto) {
    return this.charactersService.create(dto);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.charactersService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.charactersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCharacterDto) {
    return this.charactersService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.charactersService.remove(id);
  }
}
