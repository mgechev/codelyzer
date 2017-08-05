import { Config, LogLevel } from '../angular/config';

export class Logger {
  constructor(private level: number) {}

  error(...msg: string[]) {
    if (this.level & LogLevel.Error) {
      console.error.apply(console, msg);
    }
  }

  info(...msg: string[]) {
    if (this.level && LogLevel.Info) {
      console.info.apply(console, msg);
    }
  }

  debug(...msg: string[]) {
    if (this.level && LogLevel.Debug) {
      console.log.apply(console, msg);
    }
  }
}

export const logger = new Logger(Config.logLevel);
