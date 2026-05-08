import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Artisan } from './artisan.entity';
import { ProductsService } from '../products/products.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('artisans (public)')
@Public()
@Controller('artisans')
export class ArtisansController {
  constructor(
    @InjectRepository(Artisan) private readonly artisans: Repository<Artisan>,
    private readonly products: ProductsService,
  ) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get a public artisan profile by slug' })
  async getBySlug(@Param('slug') slug: string) {
    const a = await this.artisans.findOne({ where: { slug, isPublic: true } });
    if (!a) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Artisan not found' });
    }
    return a;
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'List products by an artisan slug (public)' })
  listProducts(@Param('slug') slug: string) {
    return this.products.listByArtisanSlug(slug);
  }
}
