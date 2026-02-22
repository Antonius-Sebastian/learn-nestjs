import { Transform } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class GetEstimateDto {
  @MaxLength(50)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as unknown),
  )
  make: string;

  @MaxLength(100)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as unknown),
  )
  model: string;

  @Max(new Date().getFullYear() + 5)
  @Min(1900)
  @IsNumber()
  year: number;

  @Max(1_000_000)
  @Min(0)
  @IsNumber()
  mileage: number;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}
