import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningCoupon,
  CleaningCouponDocument,
  CleaningCouponType,
} from "./entities/cleaning-coupon.entity";

@Injectable()
export class CleaningCouponRepository extends GenericRepository<CleaningCouponDocument> {
  constructor(
    @InjectModel(CleaningCoupon.name)
    private model: CleaningCouponType,
  ) {
    super(model);
  }
}
