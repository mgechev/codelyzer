import { dom, elementRoles, roles } from 'aria-query';

import { AXObjects, elementAXObjects } from 'axobject-query';

import { attributesComparator } from './attributesComparator';
import { ElementAst } from '@angular/compiler';

const domKeys = <string[]>Array.from(dom.keys());
const roleKeys: any = <string[]>Array.from(roles.keys());
const elementRoleEntries = Array.from(elementRoles);

const nonInteractiveRoles = new Set(
  roleKeys.filter((name) => {
    const role = roles.get(name);
    return !role.abstract && !role.superClass.some((classes) => classes.indexOf('widget') !== 0);
  })
);

const interactiveRoles: any = new Set(
  [
    ...roleKeys,
    // 'toolbar' does not descend from widget, but it does support
    // aria-activedescendant, thus in practice we treat it as a widget.
    'toolbar',
  ].filter((name) => {
    const role = roles.get(name);
    return !role.abstract && role.superClass.some((classes) => classes.indexOf('widget') !== 0);
  })
);

const nonInteractiveElementRoleSchemas = elementRoleEntries.reduce((accumulator: any[], [elementSchema, roleSet]: any) => {
  if (Array.from(roleSet).every((role): boolean => nonInteractiveRoles.has(role))) {
    accumulator.push(elementSchema);
  }
  return accumulator;
}, []) as any[];

const interactiveElementRoleSchemas: any[] = elementRoleEntries.reduce((accumulator: any[], [elementSchema, roleSet]: any) => {
  if (Array.from(roleSet).some((role): boolean => interactiveRoles.has(role))) {
    accumulator.push(elementSchema);
  }
  return accumulator;
}, []) as any[];

const interactiveAXObjects = new Set(Array.from(AXObjects.keys()).filter((name) => AXObjects.get(name).type === 'widget'));

const interactiveElementAXObjectSchemas = Array.from(elementAXObjects).reduce((accumulator: any[], [elementSchema, AXObjectSet]: any) => {
  if (Array.from(AXObjectSet).every((role): boolean => interactiveAXObjects.has(role))) {
    accumulator.push(elementSchema);
  }
  return accumulator;
}, []) as any[];

function checkIsInteractiveElement(el: ElementAst): boolean {
  function elementSchemaMatcher(elementSchema) {
    return el.name === elementSchema.name && attributesComparator(elementSchema.attributes, el);
  }
  // Check in elementRoles for inherent interactive role associations for
  // this element.
  const isInherentInteractiveElement = interactiveElementRoleSchemas.some(elementSchemaMatcher);

  if (isInherentInteractiveElement) {
    return true;
  }
  // Check in elementRoles for inherent non-interactive role associations for
  // this element.
  const isInherentNonInteractiveElement = nonInteractiveElementRoleSchemas.some(elementSchemaMatcher);

  if (isInherentNonInteractiveElement) {
    return false;
  }
  // Check in elementAXObjects for AX Tree associations for this element.
  const isInteractiveAXElement = interactiveElementAXObjectSchemas.some(elementSchemaMatcher);

  if (isInteractiveAXElement) {
    return true;
  }

  return false;
}

/**
 * Returns boolean indicating whether the given element is
 * interactive on the DOM or not. Usually used when an element
 * has a dynamic handler on it and we need to discern whether or not
 * it's intention is to be interacted with on the DOM.
 */
export const isInteractiveElement = (el: ElementAst): boolean => {
  if (domKeys.indexOf(el.name) === -1) {
    return false;
  }

  return checkIsInteractiveElement(el);
};
