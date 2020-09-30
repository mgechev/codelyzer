import { ElementAst, ASTWithSource, LiteralPrimitive } from '@angular/compiler';
import { PROPERTY } from './isHiddenFromScreenReader';

export const getAttributeValue = (element: ElementAst, property: string) => {
  const attr = element.attrs.find((attr) => attr.name === property);
  const input = element.inputs.find((input) => input.name === property);
  if (attr) {
    return attr.value;
  }
  if (!input || !(input.value instanceof ASTWithSource)) {
    return undefined;
  }

  if (input.value.ast instanceof LiteralPrimitive) {
    return input.value.ast.value;
  }

  return PROPERTY;
};
