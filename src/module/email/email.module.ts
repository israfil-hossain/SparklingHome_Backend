import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { EmailService } from "./email.service";

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: "gmail",
          auth: {
            user: configService.get<string>("MAILER_USER_EMAIL"),
            pass: configService.get<string>("MAILER_USER_PASSWORD"),
          },
        },
        defaults: {
          from: `Sparkling Home <${configService.get<string>(
            "MAILER_FROM",
            "no-reply@sparkling-home.com",
          )}>`,
          replyTo: `Sparkling Home <${configService.get<string>(
            "MAILER_FROM",
            "no-reply@sparkling-home.com",
          )}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
