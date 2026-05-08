import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { ulid } from 'ulid';
import { Product } from './product.entity';
import { ProductMaterial } from './product-material.entity';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { Artisan } from '../artisans/artisan.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { OwnershipContext } from '../../common/types/request-with-user';

@Injectable()
export class ProductsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductMaterial) private readonly materials: Repository<ProductMaterial>,
    @InjectRepository(Region) private readonly regions: Repository<Region>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Artisan) private readonly artisans: Repository<Artisan>,
  ) {}

  // ── Owner-scoped operations ─────────────────────────────────────────────

  async listOwned(ownership: OwnershipContext): Promise<Product[]> {
    return this.products.find({
      where: ownership.ownedProductFilter as FindOptionsWhere<Product>,
      order: { createdAt: 'DESC' },
      relations: ['materials'],
    });
  }

  async getOwned(ownership: OwnershipContext, id: string): Promise<Product> {
    const p = await this.products.findOne({
      where: { id, ...(ownership.ownedProductFilter as FindOptionsWhere<Product>) },
      relations: ['materials'],
    });
    if (!p) {
      // 404 instead of 403 — hide existence cross-tenant
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    return p;
  }

  async createOwned(ownership: OwnershipContext, dto: CreateProductDto): Promise<Product> {
    await this.assertRegionAndCategory(dto.regionId, dto.categorySlug);
    await this.assertSlugFree(dto.slug);
    this.assertMaterialsSumTo100(dto.materials.map((m) => m.percentage));

    return this.dataSource.transaction(async (manager) => {
      const productId = ulid();
      const productRepo = manager.getRepository(Product);
      const materialRepo = manager.getRepository(ProductMaterial);

      const owner = this.ownerColumns(ownership);
      const product = await productRepo.save({
        id: productId,
        slug: dto.slug,
        artisanId: owner.artisanId,
        tenantId: owner.tenantId,
        categorySlug: dto.categorySlug,
        regionId: dto.regionId,
        title: dto.title,
        descriptionShort: dto.descriptionShort,
        descriptionLong: dto.descriptionLong,
        story: dto.story ?? { en: '', fr: '', 'ar-TN': '' },
        dimensions: dto.dimensions,
        weightG: dto.weightG,
        priceTnd: dto.priceTnd.toFixed(2),
        priceEur: dto.priceEur.toFixed(2),
        photos: dto.photos,
        arModelUrl: dto.arModelUrl ?? null,
        // Placeholder TrustTag id — the real DPP record is generated in B-3.
        trusttagId: ulid(),
        publishedAt: new Date(),
        customRequest: dto.customRequest ?? false,
      });

      for (const [i, m] of dto.materials.entries()) {
        await materialRepo.save({
          id: ulid(),
          productId: product.id,
          name: m.name,
          percentage: m.percentage.toFixed(2),
          origin: m.origin ?? null,
          recycledContent: m.recycledContent ?? null,
          certifications: m.certifications ?? null,
          ordinal: i,
        });
      }

      return productRepo.findOneOrFail({
        where: { id: productId },
        relations: ['materials'],
      });
    });
  }

  async updateOwned(
    ownership: OwnershipContext,
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const existing = await this.getOwned(ownership, id);

    if (dto.regionId && dto.regionId !== existing.regionId) {
      const r = await this.regions.findOne({ where: { id: dto.regionId } });
      if (!r) {
        throw new NotFoundException({
          code: 'INVALID_REGION',
          message: `Unknown region: ${dto.regionId}`,
        });
      }
    }
    if (dto.categorySlug && dto.categorySlug !== existing.categorySlug) {
      const c = await this.categories.findOne({ where: { slug: dto.categorySlug } });
      if (!c) {
        throw new NotFoundException({
          code: 'INVALID_CATEGORY',
          message: `Unknown category: ${dto.categorySlug}`,
        });
      }
    }
    if (dto.slug && dto.slug !== existing.slug) {
      await this.assertSlugFree(dto.slug);
    }
    if (dto.materials) {
      this.assertMaterialsSumTo100(dto.materials.map((m) => m.percentage));
    }

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const materialRepo = manager.getRepository(ProductMaterial);

      const patch: Partial<Product> = {};
      if (dto.slug !== undefined) patch.slug = dto.slug;
      if (dto.categorySlug !== undefined) patch.categorySlug = dto.categorySlug;
      if (dto.regionId !== undefined) patch.regionId = dto.regionId;
      if (dto.title !== undefined) patch.title = dto.title;
      if (dto.descriptionShort !== undefined) patch.descriptionShort = dto.descriptionShort;
      if (dto.descriptionLong !== undefined) patch.descriptionLong = dto.descriptionLong;
      if (dto.story !== undefined) patch.story = dto.story;
      if (dto.dimensions !== undefined) patch.dimensions = dto.dimensions;
      if (dto.weightG !== undefined) patch.weightG = dto.weightG;
      if (dto.priceTnd !== undefined) patch.priceTnd = dto.priceTnd.toFixed(2);
      if (dto.priceEur !== undefined) patch.priceEur = dto.priceEur.toFixed(2);
      if (dto.photos !== undefined) patch.photos = dto.photos;
      if (dto.arModelUrl !== undefined) patch.arModelUrl = dto.arModelUrl;
      if (dto.customRequest !== undefined) patch.customRequest = dto.customRequest;

      if (Object.keys(patch).length > 0) {
        await productRepo.update({ id }, patch);
      }

      if (dto.materials) {
        await materialRepo.delete({ productId: id });
        for (const [i, m] of dto.materials.entries()) {
          await materialRepo.save({
            id: ulid(),
            productId: id,
            name: m.name,
            percentage: m.percentage.toFixed(2),
            origin: m.origin ?? null,
            recycledContent: m.recycledContent ?? null,
            certifications: m.certifications ?? null,
            ordinal: i,
          });
        }
      }

      return productRepo.findOneOrFail({ where: { id }, relations: ['materials'] });
    });
  }

  async deleteOwned(ownership: OwnershipContext, id: string): Promise<void> {
    const p = await this.getOwned(ownership, id);
    await this.products.delete({ id: p.id });
  }

  // ── Public read ─────────────────────────────────────────────────────────

  async listPublic(): Promise<Product[]> {
    return this.products.find({
      order: { publishedAt: 'DESC' },
      relations: ['materials'],
    });
  }

  async getPublicBySlug(slug: string): Promise<Product> {
    const p = await this.products.findOne({ where: { slug }, relations: ['materials'] });
    if (!p) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    return p;
  }

  async listByArtisanSlug(slug: string): Promise<Product[]> {
    const a = await this.artisans.findOne({ where: { slug } });
    if (!a) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Artisan not found' });
    }
    return this.products.find({
      where: { artisanId: a.id },
      order: { publishedAt: 'DESC' },
      relations: ['materials'],
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private async assertRegionAndCategory(regionId: string, categorySlug: string): Promise<void> {
    const r = await this.regions.findOne({ where: { id: regionId } });
    if (!r) {
      throw new NotFoundException({
        code: 'INVALID_REGION',
        message: `Unknown region: ${regionId}`,
      });
    }
    const c = await this.categories.findOne({ where: { slug: categorySlug } });
    if (!c) {
      throw new NotFoundException({
        code: 'INVALID_CATEGORY',
        message: `Unknown category: ${categorySlug}`,
      });
    }
  }

  private async assertSlugFree(slug: string): Promise<void> {
    const conflict = await this.products.findOne({ where: { slug } });
    if (conflict) {
      throw new ConflictException({ code: 'SLUG_TAKEN', message: `Slug already in use: ${slug}` });
    }
  }

  private assertMaterialsSumTo100(percentages: number[]): void {
    const sum = percentages.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.5) {
      throw new ConflictException({
        code: 'MATERIALS_SUM_INVALID',
        message: `Materials must sum to 100% (got ${sum.toFixed(2)}%)`,
      });
    }
  }

  private ownerColumns(ownership: OwnershipContext): {
    artisanId: string | null;
    tenantId: string | null;
  } {
    if (ownership.role === 'artisan' && ownership.artisanId) {
      return { artisanId: ownership.artisanId, tenantId: null };
    }
    if (ownership.role === 'pme_owner' && ownership.tenantId) {
      return { artisanId: null, tenantId: ownership.tenantId };
    }
    throw new NotFoundException({ code: 'NOT_FOUND', message: 'No owner profile linked' });
  }
}
