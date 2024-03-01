import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningPriceController } from "./cleaning-price.controller";
import { CleaningPriceRepository } from "./cleaning-price.repository";
import { CleaningPriceService } from "./cleaning-price.service";
import {
  CleaningPrice,
  CleaningPriceSchema,
} from "./entities/cleaning-price.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CleaningPrice.name, schema: CleaningPriceSchema },
    ]),
  ],
  controllers: [CleaningPriceController],
  providers: [CleaningPriceService, CleaningPriceRepository],
  exports: [CleaningPriceRepository],
})
export class CleaningPriceModule {}
