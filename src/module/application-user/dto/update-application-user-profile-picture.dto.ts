import { ApiProperty } from "@nestjs/swagger";

export class UpdateApplicationUserProfilePictureDto {
  @ApiProperty({
    required: true,
    description: "Profile picture",
    type: "file",
  })
  profilePicture: Express.Multer.File;
}
