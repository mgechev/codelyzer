import {Version, VERSION} from '@angular/core';
import {SemVerDSL as DSL} from 'semver-dsl';

export const SemVerDSL = DSL(VERSION.full);
