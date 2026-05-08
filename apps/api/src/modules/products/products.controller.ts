import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('products (public)')
@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products (public marketplace)' })
  list() {
    return this.products.listPublic();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a product by slug (public)' })
  getBySlug(@Param('slug') slug: string) {
    return this.products.getPublicBySlug(slug);
  }
}
