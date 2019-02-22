import { getAttributeValue } from './getAttributeValue';
import { ElementAst } from '@angular/compiler';
import { PROPERTY } from './isHiddenFromScreenReader';

const presentationRoles = new Set(['presentation', 'none', PROPERTY]);

export const isPresentationRole = (el: ElementAst) => presentationRoles.has(getAttributeValue(el, 'role'));
