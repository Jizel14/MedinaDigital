import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArtisansService } from './artisans.service';
import { UpdateMeArtisanDto } from './dto/update-me-artisan.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentOwnership } from '../../common/decorators/current-ownership.decorator';
import type { OwnershipContext } from '../../common/types/request-with-user';

@ApiTags('me / artisan')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('artisan')
@Controller('me/artisan')
export class MeArtisanController {
  constructor(private readonly artisans: ArtisansService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current artisan profile' })
  get(@CurrentOwnership() ownership: OwnershipContext) {
    if (!ownership.artisanId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'No artisan profile linked' });
    }
    return this.artisans.getOwnedById(ownership.artisanId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update the current artisan profile' })
  patch(@CurrentOwnership() ownership: OwnershipContext, @Body() dto: UpdateMeArtisanDto) {
    if (!ownership.artisanId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'No artisan profile linked' });
    }
    return this.artisans.updateOwn(ownership.artisanId, dto);
  }
}
