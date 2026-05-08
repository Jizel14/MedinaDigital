import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { Region } from '../regions/region.entity';
import { Category } from '../categories/category.entity';
import { TenantsService } from './tenants.service';
import { MeTenantController } from './me-tenant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Region, Category])],
  controllers: [MeTenantController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
