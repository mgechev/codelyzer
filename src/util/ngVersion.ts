import { VERSION } from '@angular/core';
import { SemVerDSL as DSL, ISemVerDSL } from 'semver-dsl';

export const SemVerDSL: ISemVerDSL = DSL(VERSION.full);
