import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token",
  })
  @IsNotEmpty({ message: "Refresh token should not be empty" })
  readonly refreshToken: string;
}
