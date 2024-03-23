import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { jwtConfig } from "../../config/jwt.config";
import { ApplicationUserModule } from "../application-user/application-user.module";
import { EncryptionModule } from "../encryption/encryption.module";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import {
  RefreshToken,
  RefreshTokenSchema,
} from "./entities/refresh-token.entity";
import { AuthenticationGuardProvider } from "./guard/authentication.guard";
import { RefreshTokenRepository } from "./refresh-token.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync(jwtConfig),
    ConfigModule,
    ApplicationUserModule,
    EncryptionModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationGuardProvider,
    AuthenticationService,
    RefreshTokenRepository,
  ],
})
export class AuthenticationModule {}
