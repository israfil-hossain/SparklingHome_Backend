import { ApiProperty } from "@nestjs/swagger";
import { ApplicationUserDocument } from "../../application-user/entities/application-user.entity";

export class TokenResponseDto {
  @ApiProperty({
    description: "Access token",
  })
  accessToken: string;

  @ApiProperty({
    description: "Refresh token",
  })
  refreshToken: string;

  @ApiProperty({
    description: "Refresh token",
  })
  userInfo?: ApplicationUserDocument;

  constructor(
    accessToken: string,
    refreshToken: string,
    userInfo?: ApplicationUserDocument,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (userInfo) {
      this.userInfo = userInfo;
    }
  }
}
