import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocalizedTextDto {
  @IsString() en!: string;
  @IsString() fr!: string;
  @IsString() 'ar-TN'!: string;
}

class DimensionsDto {
  @IsNumber() @Min(0) lengthCm!: number;
  @IsNumber() @Min(0) widthCm!: number;
  @IsNumber() @Min(0) heightCm!: number;
}

export class CreateProductMaterialDto {
  @ValidateNested() @Type(() => LocalizedTextDto) name!: LocalizedTextDto;
  @IsNumber() @Min(0) percentage!: number;

  @IsOptional() @IsString() origin?: string | null;
  @IsOptional() @IsInt() @Min(0) recycledContent?: number | null;
  @IsOptional() @IsArray() @IsString({ each: true }) certifications?: string[] | null;
}

export class CreateProductDto {
  @IsString() @Length(2, 128) slug!: string;

  @IsString() categorySlug!: string;

  @IsString() @Length(26, 26) regionId!: string;

  @ValidateNested() @Type(() => LocalizedTextDto) title!: LocalizedTextDto;
  @ValidateNested() @Type(() => LocalizedTextDto) descriptionShort!: LocalizedTextDto;
  @ValidateNested() @Type(() => LocalizedTextDto) descriptionLong!: LocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  story?: LocalizedTextDto;

  @ValidateNested() @Type(() => DimensionsDto) dimensions!: DimensionsDto;

  @IsInt() @Min(1) weightG!: number;

  @IsNumber() @Min(0) priceTnd!: number;
  @IsNumber() @Min(0) priceEur!: number;

  @IsArray() @IsString({ each: true }) @ArrayMinSize(1) @ArrayMaxSize(10) photos!: string[];

  @IsOptional() @IsString() arModelUrl?: string | null;

  @IsOptional() @IsBoolean() customRequest?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductMaterialDto)
  materials!: CreateProductMaterialDto[];
}
