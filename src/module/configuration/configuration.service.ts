import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { ConfigurationRepository } from "./configuration.repository";
import {
  SuppliesChargeDto,
  UpdateSuppliesChargeDto,
} from "./dto/supplies-charge.dto";

@Injectable()
export class ConfigurationService {
  private readonly logger: Logger = new Logger(ConfigurationService.name);

  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  async updateSupplierCharges(
    configurationDto: UpdateSuppliesChargeDto,
    userId: string,
  ) {
    try {
      const latestConfig = await this.configurationRepository.getOneWhere(
        {},
        { sort: { updatedAt: -1, createdAt: -1 } },
      );

      if (latestConfig) {
        await this.configurationRepository.updateOneById(latestConfig.id, {
          ...configurationDto,
          updatedBy: userId,
          updatedAt: new Date(),
        });
      } else {
        await this.configurationRepository.create({
          ...configurationDto,
          createdBy: userId,
        });
      }

      const suppliesChargeDto = new SuppliesChargeDto();
      suppliesChargeDto.suppliesCharge = configurationDto.suppliesCharge ?? 0;

      return new SuccessResponseDto(
        "Document updated successfully",
        suppliesChargeDto,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating document:", error);
      throw new BadRequestException("Error updating document");
    }
  }

  async getSupplierCharges() {
    try {
      const latestConfig = await this.configurationRepository.getOneWhere(
        {},
        { sort: { updatedAt: -1, createdAt: -1 } },
      );

      const suppliesChargeDto = new SuppliesChargeDto();
      suppliesChargeDto.suppliesCharge = latestConfig?.suppliesCharge ?? 0;

      return new SuccessResponseDto(
        "Supplier Charges retrieved successfully",
        suppliesChargeDto,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error in getting Supplier Charges:", error);
      throw new BadRequestException("Error getting document");
    }
  }
}
