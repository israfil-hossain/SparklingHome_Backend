import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningCouponController } from "./cleaning-coupon.controller";
import { CleaningCouponRepository } from "./cleaning-coupon.repository";
import { CleaningCouponService } from "./cleaning-coupon.service";
import {
  CleaningCoupon,
  CleaningCouponSchema,
} from "./entities/cleaning-coupon.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CleaningCoupon.name, schema: CleaningCouponSchema },
    ]),
  ],
  controllers: [CleaningCouponController],
  providers: [CleaningCouponService, CleaningCouponRepository],
  exports: [CleaningCouponRepository],
})
export class CleaningCouponModule {}
