import { ConsoleLogger } from "@nestjs/common";
import * as Sentry from "@sentry/node";

export class SentryLogger extends ConsoleLogger {
  error(message: any, stackOrContext?: string, context?: string): void;
  error(message: any, stack?: string, context?: string): void;
  error(message: any, ...optionalParams: [...any, string?, string?]): void {
    const { errorMessage, stack, context } = this.prepareLogParams(
      message,
      ...optionalParams,
    );
    this.captureAndLog("error", errorMessage, stack, context);
  }

  warn(message: any, context?: string): void;
  warn(message: any, ...optionalParams: [...any, string?]): void {
    const { errorMessage, context } = this.prepareLogParams(
      message,
      ...optionalParams,
    );
    this.captureAndLog("warning", errorMessage, undefined, context);
  }

  private prepareLogParams(
    message: any,
    ...optionalParams: any[]
  ): { errorMessage: string; stack?: string; context?: string } {
    let errorMessage = message.toString();
    let stack = "";
    let context = "";

    if (typeof message === "string") {
      errorMessage = message;
      if (typeof optionalParams[0] === "string") {
        stack = optionalParams[0];
        errorMessage += ` ${stack}`;
      }
      if (typeof optionalParams[1] === "string") {
        context = optionalParams[1];
      }
    }

    return { errorMessage, stack, context };
  }

  private captureAndLog(
    level: "error" | "warning",
    message: string,
    stack?: string,
    context?: string,
  ): void {
    const formattedMessage = `${context ? context.concat(": ") : ""}${message} ${stack || ""}`;
    Sentry.withScope((scope) => {
      scope.setExtra("level", level);
      scope.setExtra("stack", stack);
      scope.setExtra("context", context);
      scope.setExtra("message", message);
      Sentry.captureMessage(formattedMessage, level);
    });
    super.error(message);
  }
}
