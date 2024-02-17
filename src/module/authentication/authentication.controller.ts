import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { AuthenticationService } from "./authentication.service";
import { AuthUserId } from "./decorator/auth-user-id.decorator";
import { AdminSignInDto } from "./dto/admin-sign-in.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { IsPublic } from "./guard/authentication.guard";

@ApiTags("Authentication")
@Controller("Authentication")
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post("SignUp")
  @HttpCode(200)
  @IsPublic()
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post("SignIn")
  @HttpCode(200)
  @IsPublic()
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post("AdminSignIn")
  @HttpCode(200)
  @IsPublic()
  @ApiBody({ type: AdminSignInDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  adminSignIn(@Body() adminSignInDto: AdminSignInDto) {
    return this.authService.adminSignIn(adminSignInDto);
  }

  @Post("TokenRefresh")
  @HttpCode(200)
  @IsPublic()
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  tokenRefresh(@Body() tokenRefreshDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(tokenRefreshDto.refreshToken);
  }

  @Post("TokenRevoke")
  @HttpCode(200)
  @IsPublic()
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  tokenRevoke(@Body() tokenRefreshDto: RefreshTokenDto) {
    return this.authService.revokeRefreshToken(tokenRefreshDto.refreshToken);
  }

  @Post("ChangePassword")
  @HttpCode(200)
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @AuthUserId() { userId }: ITokenPayload,
  ) {
    return this.authService.changePassword(changePasswordDto, userId);
  }

  @Get("GetLoggedInUser")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  getLoggedInUser(@AuthUserId() { userId }: ITokenPayload) {
    return this.authService.getLoggedInUser(userId);
  }
}
