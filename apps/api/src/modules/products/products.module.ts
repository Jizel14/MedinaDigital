import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductMaterial } from './product-material.entity';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { Artisan } from '../artisans/artisan.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MeProductsController } from './me-products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductMaterial, Region, Category, Artisan])],
  controllers: [ProductsController, MeProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
