import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocalizedTextDto {
  @IsString() en!: string;
  @IsString() fr!: string;
  @IsString({ message: 'ar-TN must be a string' }) 'ar-TN'!: string;
}

export class UpdateMeArtisanDto {
  @IsOptional()
  @IsString()
  @Length(2, 128)
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  nameLocalized?: LocalizedTextDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  yearsOfPractice?: number;

  @IsOptional()
  @IsString()
  @Length(26, 26)
  regionId?: string;

  @IsOptional()
  @IsString()
  primaryCategorySlug?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  story?: LocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  shortBio?: LocalizedTextDto;

  @IsOptional()
  @IsString()
  portrait?: string;

  @IsOptional()
  @IsString()
  workshopPhoto?: string | null;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
