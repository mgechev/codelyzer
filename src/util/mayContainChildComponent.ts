import { ElementAst } from '@angular/compiler';

export function mayContainChildComponent(root: ElementAst, componentName: string): boolean {
  function traverseChildren(node: ElementAst): boolean {
    if (!node.children) {
      return false;
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i += 1) {
        const childNode: ElementAst = <ElementAst>node.children[i];
        if (childNode.name === componentName) {
          return true;
        }
        if (traverseChildren(childNode)) {
          return true;
        }
      }
    }
    return false;
  }
  return traverseChildren(root);
}
