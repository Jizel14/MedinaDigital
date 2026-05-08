import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artisan } from './artisan.entity';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { UpdateMeArtisanDto } from './dto/update-me-artisan.dto';

@Injectable()
export class ArtisansService {
  constructor(
    @InjectRepository(Artisan) private readonly artisans: Repository<Artisan>,
    @InjectRepository(Region) private readonly regions: Repository<Region>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  async getOwnedById(artisanId: string): Promise<Artisan> {
    const a = await this.artisans.findOne({ where: { id: artisanId } });
    if (!a) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Artisan profile not found' });
    }
    return a;
  }

  async updateOwn(artisanId: string, dto: UpdateMeArtisanDto): Promise<Artisan> {
    const a = await this.getOwnedById(artisanId);

    if (dto.regionId && dto.regionId !== a.regionId) {
      const found = await this.regions.findOne({ where: { id: dto.regionId } });
      if (!found) {
        throw new NotFoundException({
          code: 'INVALID_REGION',
          message: `Unknown region: ${dto.regionId}`,
        });
      }
    }
    if (dto.primaryCategorySlug && dto.primaryCategorySlug !== a.primaryCategorySlug) {
      const found = await this.categories.findOne({ where: { slug: dto.primaryCategorySlug } });
      if (!found) {
        throw new NotFoundException({
          code: 'INVALID_CATEGORY',
          message: `Unknown category: ${dto.primaryCategorySlug}`,
        });
      }
    }

    Object.assign(a, dto);
    return this.artisans.save(a);
  }
}
