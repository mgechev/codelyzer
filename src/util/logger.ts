import { Config, LogLevel } from '../angular/config';

// tslint:disable: no-console
export class Logger {
  constructor(private readonly level: number) {}

  error(...msg: string[]): void {
    if (this.level & LogLevel.Error) {
      console.error.apply(console, [msg]);
    }
  }

  info(...msg: string[]): void {
    if (this.level && LogLevel.Info) {
      console.info.apply(console, [msg]);
    }
  }

  debug(...msg: string[]): void {
    if (this.level && LogLevel.Debug) {
      console.log.apply(console, [msg]);
    }
  }
}

export const logger = new Logger(Config.logLevel);
