import { ConsoleLogger } from "@nestjs/common";
import * as Sentry from "@sentry/node";

export class SentryLogger extends ConsoleLogger {
  error(message: any, ...optionalParams: any[]): void {
    const errorMessage = message.toString();
    let stack: string | object = "";
    let logContext = "";

    if (optionalParams.length === 1) {
      logContext = optionalParams[0];
    } else if (optionalParams.length === 2) {
      [stack, logContext] = optionalParams;
    }

    const formattedMessage = logContext
      ? `${logContext}: ${errorMessage}`
      : errorMessage;

    Sentry.withScope((scope) => {
      scope.setExtra("stack", stack);
      scope.setExtra("context", logContext);
      scope.setExtra("message", errorMessage);
      Sentry.captureMessage(formattedMessage, "error");
    });

    super.error(errorMessage, ...optionalParams);
  }
}
