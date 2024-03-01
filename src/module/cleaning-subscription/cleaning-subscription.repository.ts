import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningSubscription,
  CleaningSubscriptionDocument,
  CleaningSubscriptionType,
} from "./entities/cleaning-subscription.entity";

@Injectable()
export class CleaningSubscriptionRepository extends GenericRepository<CleaningSubscriptionDocument> {
  constructor(
    @InjectModel(CleaningSubscription.name)
    private model: CleaningSubscriptionType,
  ) {
    super(model);
  }
}
