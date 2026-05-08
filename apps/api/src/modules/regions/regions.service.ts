import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './region.entity';

@Injectable()
export class RegionsService {
  constructor(@InjectRepository(Region) private readonly repo: Repository<Region>) {}

  /** Lists all regions, optionally filtered by ISO country code. */
  async list(countryCode?: string): Promise<Region[]> {
    if (countryCode) {
      return this.repo.find({ where: { countryCode }, order: { slug: 'ASC' } });
    }
    return this.repo.find({ order: { countryCode: 'ASC', slug: 'ASC' } });
  }

  async findById(id: string): Promise<Region | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySlug(countryCode: string, slug: string): Promise<Region | null> {
    return this.repo.findOne({ where: { countryCode, slug } });
  }
}
