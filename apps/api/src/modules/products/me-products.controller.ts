import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentOwnership } from '../../common/decorators/current-ownership.decorator';
import type { OwnershipContext } from '../../common/types/request-with-user';

@ApiTags('me / products')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('artisan', 'pme_owner')
@Controller('me/products')
export class MeProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products owned by the current user' })
  list(@CurrentOwnership() ownership: OwnershipContext) {
    return this.products.listOwned(ownership);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product owned by the current user' })
  create(@CurrentOwnership() ownership: OwnershipContext, @Body() dto: CreateProductDto) {
    return this.products.createOwned(ownership, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product owned by the current user' })
  getOne(@CurrentOwnership() ownership: OwnershipContext, @Param('id') id: string) {
    return this.products.getOwned(ownership, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product owned by the current user' })
  patch(
    @CurrentOwnership() ownership: OwnershipContext,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.updateOwned(ownership, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product owned by the current user' })
  async delete(@CurrentOwnership() ownership: OwnershipContext, @Param('id') id: string) {
    await this.products.deleteOwned(ownership, id);
  }
}
