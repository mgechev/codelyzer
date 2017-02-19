import {Version, VERSION} from '@angular/core';
import * as semver from 'semver';

export interface AngularVersionRunner {
  gte(version: string, callback: Function): AngularVersionRunner;
  lte(version: string, callback: Function): AngularVersionRunner;
  gt(version: string, callback: Function): AngularVersionRunner;
  lt(version: string, callback: Function): AngularVersionRunner;
  eq(version: string, callback: Function): AngularVersionRunner;
  between(v1: string, v2: string, callback: Function): AngularVersionRunner;
}

export const VersionRunner: AngularVersionRunner = {
  gte(version: string, callback: Function) {
    if (semver.gte(VERSION.full, version)) {
      callback();
    }
    return this;
  },
  lte(version: string, callback: Function) {
    if (semver.lte(VERSION.full, version)) {
      callback();
    }
    return this;
  },
  gt(version: string, callback: Function) {
    if (semver.gt(VERSION.full, version)) {
      callback();
    }
    return this;
  },
  lt(version: string, callback: Function) {
    if (semver.lt(VERSION.full, version)) {
      callback();
    }
    return this;
  },
  eq(version: string, callback: Function) {
    if (semver.eq(version, VERSION.full)) {
      callback();
    }
    return this;
  },
  between(v1: string, v2: string, callback: Function) {
    if (semver.gte(VERSION.full, v1) && semver.lte(VERSION.full, v2)) {
      callback();
    }
    return this;
  }
};
