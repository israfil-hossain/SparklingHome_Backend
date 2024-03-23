import { Controller, Get } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { DashboardService } from "./dashboard.service";

@ApiTags("Dashboard")
@Controller("Dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("GetCardStats")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  getCardStats() {
    return this.dashboardService.getCardStats();
  }
}
