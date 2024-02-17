import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  RefreshToken,
  RefreshTokenDocument,
  RefreshTokenType,
} from "./entities/refresh-token.entity";

@Injectable()
export class RefreshTokenRepository extends GenericRepository<RefreshTokenDocument> {
  constructor(
    @InjectModel(RefreshToken.name)
    private model: RefreshTokenType,
  ) {
    super(model);
  }
}
