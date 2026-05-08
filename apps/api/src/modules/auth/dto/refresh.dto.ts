import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'A valid refresh token (JWT, signed with JWT_REFRESH_SECRET)' })
  @IsJWT()
  refreshToken!: string;
}
