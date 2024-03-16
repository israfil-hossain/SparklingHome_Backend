import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";
import { CreateCleaningSubscriptionDto } from "./dto/create-cleaning-subscription.dto";

@ApiTags("Cleaning Subscription")
@Controller("CleaningSubscription")
export class CleaningSubscriptionController {
  constructor(
    private readonly cleaningSubscriptionService: CleaningSubscriptionService,
  ) {}

  @Post("AddSubscription")
  @ApiBody({ type: CreateCleaningSubscriptionDto })
  @ApiResponse({
    status: 201,
    type: SuccessResponseDto,
  })
  @IsPublic()
  addSubscription(@Body() createDto: CreateCleaningSubscriptionDto) {
    return this.cleaningSubscriptionService.addSubscription(createDto);
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
