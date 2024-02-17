import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as base64url from "base64url";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";

@Injectable()
export class EncryptionService {
  private readonly saltRounds: number = 10;
  private readonly logger: Logger = new Logger(EncryptionService.name);

  async hashPassword(rawPassword: string): Promise<string> {
    if (!rawPassword) {
      this.logger.error("Password is required");
      throw new BadRequestException("Password is required");
    }

    return await bcrypt.hash(rawPassword, this.saltRounds);
  }

  async verifyPassword(
    rawPassword: string = "",
    hashedPassword: string = "",
  ): Promise<boolean> {
    if (!rawPassword) {
      this.logger.error("Password is required");
      throw new BadRequestException("Password is required");
    }

    return await bcrypt.compare(rawPassword, hashedPassword);
  }

  generateUniqueToken(length: number = 3): string {
    const mergedUuid = Array.from({ length }, () => uuid.v4()).join("");
    const tokenBuffer = Buffer.from(mergedUuid.replace(/-/g, ""), "hex");
    return base64url.default(tokenBuffer);
  }
}
