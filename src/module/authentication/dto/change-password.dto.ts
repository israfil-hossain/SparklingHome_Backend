import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { IsNotEqualTo } from "../../../utility/validator/is-not-equal-to.validator";

export class ChangePasswordDto {
  @ApiProperty({
    description: "The user's old password",
  })
  @IsNotEmpty({ message: "Old password is required" })
  @IsString({ message: "Old password must be a string" })
  oldPassword: string;

  @ApiProperty({
    description: "The user's new password",
  })
  @IsNotEmpty({ message: "New password should not be empty" })
  @MinLength(8, { message: "New password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]*$/, {
    message:
      "New password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  @IsNotEqualTo("oldPassword", {
    message: "New password must be different from the old password",
  })
  newPassword: string;
}
