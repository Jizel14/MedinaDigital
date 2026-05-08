import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateMeTenantDto {
  @IsOptional()
  @IsString()
  @Length(2, 128)
  businessName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 128)
  businessNameAr?: string | null;

  @IsOptional()
  @IsString()
  @Length(26, 26)
  regionId?: string;

  @IsOptional()
  @IsString()
  primaryCategorySlug?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearFounded?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  artisanCount?: number;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  patenteNumber?: string | null;

  @IsOptional()
  @IsIn(['fr', 'ar-TN'])
  preferredLanguage?: 'fr' | 'ar-TN';
}
