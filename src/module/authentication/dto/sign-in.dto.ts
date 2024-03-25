import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @ApiProperty({
    description: "User's email",
    example: "user@example.com",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({
    description: "User's password",
    example: "Password123!",
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString({ message: "Password must be a string" })
  password: string;
}
