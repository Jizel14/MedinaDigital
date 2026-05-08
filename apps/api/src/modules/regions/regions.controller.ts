import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { Region } from './region.entity';

@ApiTags('regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regions: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'List regions, optionally filtered by ISO country code (e.g. TN)' })
  list(@Query('country') country?: string): Promise<Region[]> {
    return this.regions.list(country);
  }
}
