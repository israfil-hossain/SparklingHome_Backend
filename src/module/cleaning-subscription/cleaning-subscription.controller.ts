import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";
import { CreateCleaningSubscriptionDto } from "./dto/create-cleaning-subscription.dto";

@ApiTags("Cleaning Subscription")
@Controller("CleaningSubscription")
export class CleaningSubscriptionController {
  constructor(
    private readonly cleaningSubscriptionService: CleaningSubscriptionService,
  ) {}

  @Post("Create")
  @ApiBody({ type: CreateCleaningSubscriptionDto })
  @ApiResponse({
    status: 201,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  create(
    @AuthUserId() { userId }: ITokenPayload,
    @Body() createDto: CreateCleaningSubscriptionDto,
  ) {
    return this.cleaningSubscriptionService.create(createDto, userId);
  }

  @Get("GetUserSubscription")
  getUserSubscription(@AuthUserId() { userId }: ITokenPayload) {
    return this.cleaningSubscriptionService.getUserSubscription(userId);
  }

  @Get("GetAllSubscriptionTypes")
  getAllCleaningSubscriptionTypes() {
    return this.cleaningSubscriptionService.getAllCleaningSubscriptionTypes();
  }
}
