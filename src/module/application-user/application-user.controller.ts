import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { DocIdQueryDto } from "../common/dto/doc-id-query.dto";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { ApplicationUserService } from "./application-user.service";
import { RequiredRoles } from "./decorator/roles.decorator";
import { ListApplicationUserQuery } from "./dto/list-application-user-query.dto";
import { UpdateApplicationUserProfilePictureDto } from "./dto/update-application-user-profile-picture.dto";
import { UpdateApplicationUserDto } from "./dto/update-application-user.dto";
import { ApplicationUserRoleEnum } from "./enum/application-user-role.enum";

@ApiTags("Application Users")
@Controller("ApplicationUser")
export class ApplicationUserController {
  constructor(private readonly userService: ApplicationUserService) {}

  // @Post("Create")
  // @ApiBody({ type: CreateApplicationUserDto })
  // @ApiResponse({
  //   status: 201,
  //   type: SuccessResponseDto,
  // })
  // @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  // create(@Body() createUserDto: CreateApplicationUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get("GetAll")
  @ApiResponse({
    status: 200,
    type: PaginatedResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  findAll(@Query() query: ListApplicationUserQuery) {
    return this.userService.findAll(query);
  }

  @Get("GetById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  findOne(@Param() { DocId }: DocIdQueryDto) {
    return this.userService.findOne(DocId);
  }

  @Patch("UpdateById/:DocId")
  @ApiBody({ type: UpdateApplicationUserDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  update(
    @Param() { DocId }: DocIdQueryDto,
    @Body() updateApplicationUserDto: UpdateApplicationUserDto,
  ) {
    return this.userService.update(DocId, updateApplicationUserDto);
  }

  @Delete("DeleteById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  remove(@Param() { DocId }: DocIdQueryDto) {
    return this.userService.remove(DocId);
  }

  @Patch("UpdateOwnProfile")
  @ApiBody({ type: UpdateApplicationUserDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  updateOwnUser(
    @AuthUserId() { userId }: ITokenPayload,
    @Body() updateApplicationUserDto: UpdateApplicationUserDto,
  ) {
    return this.userService.update(userId, updateApplicationUserDto);
  }

  @Patch("UpdateOwnProfilePicture")
  @ApiBody({ type: UpdateApplicationUserProfilePictureDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("profilePicture"))
  updateOwnUserProfilePicture(
    @AuthUserId() { userId }: ITokenPayload,
    @UploadedFile() profilePicture: Express.Multer.File,
    @Body() updateProfilePictureDto: UpdateApplicationUserProfilePictureDto,
  ) {
    updateProfilePictureDto.profilePicture = profilePicture;

    return this.userService.updateOwnUserProfilePicture(
      updateProfilePictureDto,
      userId,
    );
  }
}
