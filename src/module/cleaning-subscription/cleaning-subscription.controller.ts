import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { DocIdQueryDto } from "../common/dto/doc-id-query.dto";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";
import { CreateCleaningSubscriptionDto } from "./dto/create-cleaning-subscription.dto";
import { ListCleaningSubscriptionQueryDto } from "./dto/list-cleaning-subscription-query.dto";
import { UpdateCleaningSubscriptionDto } from "./dto/update-cleaning-subscription.dto";

@ApiTags("Cleaning Subscription")
@Controller("CleaningSubscription")
export class CleaningSubscriptionController {
  constructor(
    private readonly cleaningSubscriptionService: CleaningSubscriptionService,
  ) {}

  @Get("GetUserSubscription")
  getUserSubscription(@AuthUserId() { userId }: ITokenPayload) {
    return this.cleaningSubscriptionService.getUserSubscription(userId);
  }

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

  @Patch("UpdateSubscriptionById/:DocId")
  @ApiBody({ type: UpdateCleaningSubscriptionDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  updateSubscription(
    @AuthUserId() authUser: ITokenPayload,
    @Param() { DocId }: DocIdQueryDto,
    @Body() updateDto: UpdateCleaningSubscriptionDto,
  ) {
    return this.cleaningSubscriptionService.updateSubscription(
      DocId,
      updateDto,
      authUser,
    );
  }

  @Patch("CancelSubscriptionById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  cancelSubscription(
    @AuthUserId() authUser: ITokenPayload,
    @Param() { DocId }: DocIdQueryDto,
  ) {
    return this.cleaningSubscriptionService.cancelSubscription(authUser, DocId);
  }

  @Get("GetAll")
  @ApiResponse({
    status: 200,
    type: PaginatedResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  findAll(@Query() queryDto: ListCleaningSubscriptionQueryDto) {
    return this.cleaningSubscriptionService.findAll(queryDto);
  }

  @Get("GetById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  findOne(@Param() { DocId }: DocIdQueryDto) {
    return this.cleaningSubscriptionService.findOne(DocId);
  }
}
