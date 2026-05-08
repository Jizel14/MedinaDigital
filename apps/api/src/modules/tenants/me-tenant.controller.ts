import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { UpdateMeTenantDto } from './dto/update-me-tenant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentOwnership } from '../../common/decorators/current-ownership.decorator';
import type { OwnershipContext } from '../../common/types/request-with-user';

@ApiTags('me / tenant')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('pme_owner')
@Controller('me/tenant')
export class MeTenantController {
  constructor(private readonly tenants: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current tenant (PME) profile' })
  get(@CurrentOwnership() ownership: OwnershipContext) {
    if (!ownership.tenantId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'No tenant profile linked' });
    }
    return this.tenants.getOwnedById(ownership.tenantId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update the current tenant (PME) profile' })
  patch(@CurrentOwnership() ownership: OwnershipContext, @Body() dto: UpdateMeTenantDto) {
    if (!ownership.tenantId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'No tenant profile linked' });
    }
    return this.tenants.updateOwn(ownership.tenantId, dto);
  }
}
