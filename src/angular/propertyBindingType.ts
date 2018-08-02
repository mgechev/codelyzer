import * as ast from '@angular/compiler';

// Since 50d4a4f, Angular's compiler exports PropertyBindingType
// as a const enum which declaration does not get emitted to JavaScript.
export const enum PropertyBindingType {
  // A normal binding to a property (e.g. `[property]="expression"`).
  Property = ast.PropertyBindingType.Property,
  // A binding to an element attribute (e.g. `[attr.name]="expression"`).
  Attribute = ast.PropertyBindingType.Attribute,
  // A binding to a CSS class (e.g. `[class.name]="condition"`).
  Class = ast.PropertyBindingType.Class,
  // A binding to a style rule (e.g. `[style.rule]="expression"`).
  Style = ast.PropertyBindingType.Style,
  // A binding to an animation reference (e.g. `[animate.key]="expression"`).
  Animation = ast.PropertyBindingType.Attribute
}
