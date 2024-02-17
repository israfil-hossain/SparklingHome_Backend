import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { ConfigurationService } from "./configuration.service";
import { UpdateCommissionSettingsDto } from "./dto/commission-settings.dto";

@ApiTags("Configurations")
@Controller("Configuration")
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Patch("SetCommissionSettings")
  @ApiBody({ type: UpdateCommissionSettingsDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  updateCommission(
    @AuthUserId() { userId }: ITokenPayload,
    @Body() updateCommissionSettingsDto: UpdateCommissionSettingsDto,
  ) {
    return this.configurationService.updateCommissionSettings(
      updateCommissionSettingsDto,
      userId,
    );
  }

  @Get("GetCommissionSettings")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  getCommission() {
    return this.configurationService.getCommissionSettings();
  }
}
