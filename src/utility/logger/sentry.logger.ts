import { ConsoleLogger } from "@nestjs/common";
import * as Sentry from "@sentry/node";

export class SentryLogger extends ConsoleLogger {
  error(message: any, stackOrContext?: string | object, context?: string): void;
  error(message: any, stack?: string | object, context?: string): void;
  error(message: any, ...optionalParams: [...any]): void {
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
    this.captureAndLog("warn", errorMessage, undefined, context);
  }

  private prepareLogParams(
    message: any,
    ...optionalParams: any[]
  ): { errorMessage: string; stack?: string | object; context?: string } {
    const errorMessage = message.toString();
    let stack: string | object = "";
    let context = "";

    if (optionalParams?.length === 1) {
      context = optionalParams[0];
    }
    if (optionalParams?.length === 2) {
      stack = optionalParams[0];
      context = optionalParams[1];
    }

    return { errorMessage, stack, context };
  }

  private captureAndLog(
    level: "error" | "warn",
    message: string,
    stack?: string | object,
    context?: string,
  ): void {
    const formattedMessage = `${context ? context.concat(": ") : ""}${message}}`;

    Sentry.withScope((scope) => {
      scope.setExtra("level", level);
      scope.setExtra("stack", stack);
      scope.setExtra("context", context);
      scope.setExtra("message", message);
      Sentry.captureMessage(formattedMessage, "warning");
    });

    if (stack) {
      super[level](message, stack, context);
    } else {
      super[level](message, context);
    }
  }
}
