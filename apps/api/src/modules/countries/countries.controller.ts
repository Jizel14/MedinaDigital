import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CountriesService } from './countries.service';
import { Country } from './country.entity';

@ApiTags('countries')
@Controller('countries')
@Public()
export class CountriesController {
  constructor(private readonly countries: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active countries' })
  list(): Promise<Country[]> {
    return this.countries.listActive();
  }
}
