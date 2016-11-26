import {Config, LogLevel} from '../angular/config';

class Logger {
  constructor(private level: number) {}

  error(...msg: string[]) {
    if (this.level & LogLevel.Error) {
      console.error.apply(console, msg);
    }
  }

  info(...msg: string[]) {
    if (this.level && LogLevel.Info) {
      console.error.apply(console, msg);
    }
  }

  debug(...msg: string[]) {
    if (this.level && LogLevel.Debug) {
      console.error.apply(console, msg);
    }
  }
}

export const logger = new Logger(Config.logLevel);
