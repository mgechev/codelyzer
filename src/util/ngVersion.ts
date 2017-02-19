import {Version, VERSION} from '@angular/core';
import * as semver from 'semver';

export interface AngularVersionRunner {
  gte(version: string, callback: Function): AngularContextVersionRunner;
  lte(version: string, callback: Function): AngularContextVersionRunner;
  gt(version: string, callback: Function): AngularContextVersionRunner;
  lt(version: string, callback: Function): AngularContextVersionRunner;
  eq(version: string, callback: Function): AngularContextVersionRunner;
  between(v1: string, v2: string, callback: Function): AngularContextVersionRunner;
}

export interface AngularContextVersionRunner extends AngularVersionRunner {
  else(callback: Function): AngularVersionRunner;
}

export const VersionRunner: AngularVersionRunner = {
  gte(version: string, callback: Function) {
    if (semver.gte(VERSION.full, version)) {
      callback();
    }
    return getContextRunner(() => {
      return semver.lt(VERSION.full, version);
    });
  },
  lte(version: string, callback: Function) {
    if (semver.lte(VERSION.full, version)) {
      callback();
    }
    return getContextRunner(() => {
      return semver.gt(VERSION.full, version);
    });
  },
  gt(version: string, callback: Function) {
    if (semver.gt(VERSION.full, version)) {
      callback();
    }
    return getContextRunner(() => {
      return semver.lte(VERSION.full, version);
    });
  },
  lt(version: string, callback: Function) {
    if (semver.lt(VERSION.full, version)) {
      callback();
    }
    return getContextRunner(() => {
      return semver.gte(VERSION.full, version);
    });
  },
  eq(version: string, callback: Function) {
    if (semver.eq(version, VERSION.full)) {
      callback();
    }
    return getContextRunner(() => {
      return semver.neq(VERSION.full, version);
    });
  },
  between(v1: string, v2: string, callback: Function) {
    if (semver.gte(VERSION.full, v1) && semver.lte(VERSION.full, v2)) {
      callback();
    }
    return getContextRunner(() => {
      return semver.gt(v1, VERSION.full) || semver.lt(v2, VERSION.full);
    });
  }
};

function getContextRunner(predicate: Function) {
  return Object.create(VersionRunner, {
    else: {
      value(callback: Function) {
        if (predicate()) callback();
      }
    }
  });
};
