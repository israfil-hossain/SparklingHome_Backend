import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { ConfigurationRepository } from "./configuration.repository";
import {
  CommissionSettingsDto,
  UpdateCommissionSettingsDto,
} from "./dto/commission-settings.dto";

@Injectable()
export class ConfigurationService {
  private readonly logger: Logger = new Logger(ConfigurationService.name);

  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  async updateCommissionSettings(
    configurationDto: UpdateCommissionSettingsDto,
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

      const commissionDto = new CommissionSettingsDto();
      commissionDto.ownerCommission = configurationDto.ownerCommission ?? 0;
      commissionDto.renterCommission = configurationDto.renterCommission ?? 0;

      return new SuccessResponseDto(
        "Document updated successfully",
        commissionDto,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating document:", error);
      throw new BadRequestException("Error updating document");
    }
  }

  async getCommissionSettings() {
    try {
      const latestConfig = await this.configurationRepository.getOneWhere(
        {},
        { sort: { updatedAt: -1, createdAt: -1 } },
      );

      const commissionDto = new CommissionSettingsDto();
      commissionDto.ownerCommission = latestConfig?.ownerCommission ?? 0;
      commissionDto.renterCommission = latestConfig?.renterCommission ?? 0;

      return new SuccessResponseDto(
        "Commission settings retrieved successfully",
        commissionDto,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error in getting Commission Settings:", error);
      throw new BadRequestException("Error getting document");
    }
  }
}
