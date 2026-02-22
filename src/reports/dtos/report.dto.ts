import { Expose, Transform } from 'class-transformer';
import { Report } from '../reports.entity';

export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  price: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Expose()
  year: number;

  @Expose()
  mileage: number;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose()
  approved: boolean;

  @Transform(({ obj }: { obj: Report }) => obj.user.id)
  @Expose()
  userId: number;
}
