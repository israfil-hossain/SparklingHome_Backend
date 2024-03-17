import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as base64url from "base64url";
import * as bcrypt from "bcrypt";
import { createCipheriv, createDecipheriv, createHash } from "crypto";
import * as uuid from "uuid";

@Injectable()
export class EncryptionService {
  private readonly logger: Logger = new Logger(EncryptionService.name);
  private readonly saltRounds: number = 10;
  private readonly algorithm: string = "aes-256-cbc";
  private readonly ivLength: number = 16;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>(
      "ENCRYPTION_SECRET",
      "BZVhSEsOi1g5sqrorAWKZULxkZ2d2NBQ",
    );
  }

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

  generateTemporaryPassword(length = 10) {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numericChars = "0123456789";
    const specialChars = "!@#$%^&*()-_+=";

    const allChars =
      lowercaseChars + uppercaseChars + numericChars + specialChars;

    let password = "";
    try {
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
      }
    } catch (error) {
      throw new InternalServerErrorException("Failed to generate a password");
    }

    return password;
  }

  encryptString(text: string): string {
    if (!text) throw new Error(text);

    try {
      const key = createHash("sha256")
        .update(this.secretKey)
        .digest("base64")
        .slice(0, 32);
      const iv = Buffer.alloc(this.ivLength, 0);

      const cipher = createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(text, "utf8", "base64");
      encrypted += cipher.final("base64");

      return encrypted;
    } catch (_) {
      throw new InternalServerErrorException("Encryption failed");
    }
  }

  decryptString(cipherText: string): string {
    if (!cipherText) throw new Error(cipherText);

    try {
      const key = createHash("sha256")
        .update(this.secretKey)
        .digest("base64")
        .slice(0, 32);
      const iv = Buffer.alloc(this.ivLength, 0);

      const decipher = createDecipheriv(this.algorithm, key, iv);
      let decrypted = decipher.update(cipherText, "base64", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (_) {
      throw new InternalServerErrorException("Decryption failed");
    }
  }
}
