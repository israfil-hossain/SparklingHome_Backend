import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningPrice,
  CleaningPriceDocument,
  CleaningPriceType,
} from "./entities/cleaning-price.entity";

@Injectable()
export class CleaningPriceRepository extends GenericRepository<CleaningPriceDocument> {
  constructor(
    @InjectModel(CleaningPrice.name)
    private model: CleaningPriceType,
  ) {
    super(model);
  }
}
