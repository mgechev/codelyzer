import { ElementAst } from '@angular/compiler';
import { getAttributeValue } from './getAttributeValue';
import { getLiteralValue } from './getLiteralValue';

export const PROPERTY = ['PROPERTY'];
/**
 * Returns boolean indicating that the aria-hidden prop
 * is present or the value is true. Will also return true if
 * there is an input with type='hidden'.
 *
 * <div aria-hidden /> is equivalent to the DOM as <div aria-hidden=true />.
 */
export const isHiddenFromScreenReader = (el: ElementAst) => {
  if (el.name.toUpperCase() === 'INPUT') {
    const hidden = getAttributeValue(el, 'type');

    if (hidden && hidden.toUpperCase() === 'HIDDEN') {
      return true;
    }
  }

  const ariaHidden = getLiteralValue(getAttributeValue(el, 'aria-hidden'));
  return ariaHidden === PROPERTY || ariaHidden === true;
};
