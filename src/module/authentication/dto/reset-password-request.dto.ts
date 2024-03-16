import { PickType } from "@nestjs/swagger";
import { SignInDto } from "./sign-in.dto";

export class ResetPasswordRequestDto extends PickType(SignInDto, [
  "email",
] as const) {}
