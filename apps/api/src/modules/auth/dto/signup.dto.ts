import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class SignupArtisanProfileDto {
  @ApiProperty({ example: 'Khaled Ben Ahmed' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;

  @ApiProperty({ description: 'Region ULID (use GET /api/regions to list)' })
  @IsString()
  @IsNotEmpty()
  regionId!: string;

  @ApiProperty({ example: 'ceramics' })
  @IsString()
  @IsNotEmpty()
  primaryCategorySlug!: string;

  @ApiProperty({ example: 12, minimum: 0, maximum: 80 })
  @IsInt()
  @Min(0)
  @Max(80)
  yearsOfPractice!: number;
}

class SignupTenantProfileDto {
  @ApiProperty({ example: 'Atelier Médina' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  businessName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  regionId!: string;

  @ApiProperty({ example: 'ceramics' })
  @IsString()
  @IsNotEmpty()
  primaryCategorySlug!: string;

  @ApiProperty({ required: false, example: 2018 })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  yearFounded?: number;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  artisanCount?: number;
}

export class SignupDto {
  @ApiProperty({ example: 'khaled@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'aStrongPassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: ['artisan', 'pme_owner'] })
  @IsEnum(['artisan', 'pme_owner'])
  role!: 'artisan' | 'pme_owner';

  @ApiProperty({ type: SignupArtisanProfileDto, required: false })
  @ValidateIf((o: SignupDto) => o.role === 'artisan')
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SignupArtisanProfileDto)
  artisan?: SignupArtisanProfileDto;

  @ApiProperty({ type: SignupTenantProfileDto, required: false })
  @ValidateIf((o: SignupDto) => o.role === 'pme_owner')
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SignupTenantProfileDto)
  tenant?: SignupTenantProfileDto;
}
