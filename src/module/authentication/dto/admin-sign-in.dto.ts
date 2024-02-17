import { PickType } from "@nestjs/swagger";
import { SignInDto } from "./sign-in.dto";

export class AdminSignInDto extends PickType(SignInDto, [
  "email",
  "password",
]) {}
