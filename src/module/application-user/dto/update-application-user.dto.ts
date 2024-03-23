import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateApplicationUserDto } from "./create-application-user.dto";

export class UpdateApplicationUserDto extends PartialType(
  OmitType(CreateApplicationUserDto, ["password"]),
) {
  @ApiProperty({
    required: false,
    description: "Specify if enitiy is active or not",
  })
  @IsOptional()
  @IsBoolean({ message: "Must be a boolean" })
  isActive?: boolean;
}
