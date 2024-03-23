import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningTimeSlotService } from "./cleaning-time-slot.service";
import { CreateCleaningTimeSlotDto } from "./dto/create-cleaning-time-slot.dto";

@ApiTags("Cleaning Time Slots")
@Controller("CleaningTimeSlot")
export class CleaningTimeSlotController {
  constructor(
    private readonly cleaningTimeSlotService: CleaningTimeSlotService,
  ) {}

  @Post("Create")
  @ApiBody({ type: CreateCleaningTimeSlotDto })
  @ApiResponse({
    status: 201,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  create(
    @AuthUserId() { userId }: ITokenPayload,
    @Body() createDto: CreateCleaningTimeSlotDto,
  ) {
    return this.cleaningTimeSlotService.create(createDto, userId);
  }

  @Get("GetAll")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  findAll() {
    return this.cleaningTimeSlotService.findAll();
  }

  @Get("GetAllByWeekdays")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @IsPublic()
  findAllByWeekdays() {
    return this.cleaningTimeSlotService.findAllByWeekdays();
  }
}
