import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artisan } from './artisan.entity';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { ArtisansService } from './artisans.service';
import { MeArtisanController } from './me-artisan.controller';
import { ArtisansController } from './artisans.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Artisan, Region, Category]), ProductsModule],
  controllers: [MeArtisanController, ArtisansController],
  providers: [ArtisansService],
  exports: [ArtisansService],
})
export class ArtisansModule {}
