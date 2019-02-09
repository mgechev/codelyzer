import { ElementAst } from '@angular/compiler';

export const getAttributeValue = (element: ElementAst, property: string) => {
  const attr = element.attrs.find(attr => attr.name === property);
  const input = element.inputs.find(input => input.name === property);
  if (attr) {
    return attr.value;
  }
  if (input) {
    return (<any>input.value).ast.value;
  }
};
