import { ElementAst, AttrAst, BoundElementPropertyAst } from '@angular/compiler';
import { getAttributeValue } from './getAttributeValue';
import { getLiteralValue } from './getLiteralValue';

export function attributesComparator(baseAttributes: any = [], el: ElementAst): boolean {
  const attributes: Array<AttrAst | BoundElementPropertyAst> = [...el.attrs, ...el.inputs];
  return baseAttributes.every((baseAttr): boolean =>
    attributes.some((attribute): boolean => {
      if (el.name === 'a' && attribute.name === 'routerLink') {
        return true;
      }
      if (baseAttr.name !== attribute.name) {
        return false;
      }
      if (baseAttr.value && baseAttr.value !== getLiteralValue(getAttributeValue(el, baseAttr.name))) {
        return false;
      }
      return true;
    })
  );
}
