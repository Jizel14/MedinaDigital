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
import { CreateProductMaterialDto } from './create-product.dto';

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

export class UpdateProductDto {
  @IsOptional() @IsString() @Length(2, 128) slug?: string;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsString() @Length(26, 26) regionId?: string;

  @IsOptional() @ValidateNested() @Type(() => LocalizedTextDto) title?: LocalizedTextDto;
  @IsOptional() @ValidateNested() @Type(() => LocalizedTextDto) descriptionShort?: LocalizedTextDto;
  @IsOptional() @ValidateNested() @Type(() => LocalizedTextDto) descriptionLong?: LocalizedTextDto;
  @IsOptional() @ValidateNested() @Type(() => LocalizedTextDto) story?: LocalizedTextDto;

  @IsOptional() @ValidateNested() @Type(() => DimensionsDto) dimensions?: DimensionsDto;

  @IsOptional() @IsInt() @Min(1) weightG?: number;
  @IsOptional() @IsNumber() @Min(0) priceTnd?: number;
  @IsOptional() @IsNumber() @Min(0) priceEur?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  photos?: string[];

  @IsOptional() @IsString() arModelUrl?: string | null;
  @IsOptional() @IsBoolean() customRequest?: boolean;

  // Replace-all-or-nothing semantics for materials.
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductMaterialDto)
  materials?: CreateProductMaterialDto[];
}
