import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  Configuration,
  ConfigurationDocument,
  ConfigurationType,
} from "./entities/configuration.entity";

@Injectable()
export class ConfigurationRepository extends GenericRepository<ConfigurationDocument> {
  constructor(
    @InjectModel(Configuration.name)
    private model: ConfigurationType,
  ) {
    super(model, new Logger(ConfigurationRepository.name));
  }
}
