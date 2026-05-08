import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { UpdateMeTenantDto } from './dto/update-me-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private readonly tenants: Repository<Tenant>,
    @InjectRepository(Region) private readonly regions: Repository<Region>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  async getOwnedById(tenantId: string): Promise<Tenant> {
    const t = await this.tenants.findOne({ where: { id: tenantId } });
    if (!t) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Tenant profile not found' });
    }
    return t;
  }

  async updateOwn(tenantId: string, dto: UpdateMeTenantDto): Promise<Tenant> {
    const t = await this.getOwnedById(tenantId);

    if (dto.regionId && dto.regionId !== t.regionId) {
      const found = await this.regions.findOne({ where: { id: dto.regionId } });
      if (!found) {
        throw new NotFoundException({
          code: 'INVALID_REGION',
          message: `Unknown region: ${dto.regionId}`,
        });
      }
    }
    if (dto.primaryCategorySlug && dto.primaryCategorySlug !== t.primaryCategorySlug) {
      const found = await this.categories.findOne({ where: { slug: dto.primaryCategorySlug } });
      if (!found) {
        throw new NotFoundException({
          code: 'INVALID_CATEGORY',
          message: `Unknown category: ${dto.primaryCategorySlug}`,
        });
      }
    }

    Object.assign(t, dto);
    return this.tenants.save(t);
  }
}
