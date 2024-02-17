import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  ApplicationUser,
  ApplicationUserDocument,
  ApplicationUserType,
} from "./entities/application-user.entity";

@Injectable()
export class ApplicationUserRepository extends GenericRepository<ApplicationUserDocument> {
  constructor(
    @InjectModel(ApplicationUser.name)
    private model: ApplicationUserType,
  ) {
    super(model);
  }
}
