import { ApiProperty } from '@nestjs/swagger';
import { TouristResponseDto } from './tourist-response.dto';
import { TouristListMeta } from '../interfaces/tourist-list-meta.interface';

class TouristListMetaDto implements TouristListMeta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class TouristListResponseDto {
  @ApiProperty({ type: [TouristResponseDto] })
  items: TouristResponseDto[];

  @ApiProperty()
  meta: TouristListMetaDto;
}
