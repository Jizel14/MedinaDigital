import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './country.entity';

@Injectable()
export class CountriesService {
  constructor(@InjectRepository(Country) private readonly repo: Repository<Country>) {}

  listActive(): Promise<Country[]> {
    return this.repo.find({ where: { isActive: true }, order: { code: 'ASC' } });
  }
}
