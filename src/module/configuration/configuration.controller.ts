import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { ConfigurationService } from "./configuration.service";
import { UpdateSuppliesChargeDto } from "./dto/supplies-charge.dto";

@ApiTags("Configurations")
@Controller("Configuration")
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Patch("SetSuppliesCharge")
  @ApiBody({ type: UpdateSuppliesChargeDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  updateSupplierCharges(
    @AuthUserId() { userId }: ITokenPayload,
    @Body() updateSuppliesChargeDto: UpdateSuppliesChargeDto,
  ) {
    return this.configurationService.updateSupplierCharges(
      updateSuppliesChargeDto,
      userId,
    );
  }

  @Get("GetSuppliesCharge")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @IsPublic()
  getSupplierCharges() {
    return this.configurationService.getSupplierCharges();
  }
}
