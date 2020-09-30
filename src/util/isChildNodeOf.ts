import { ElementAst } from '@angular/compiler';

export const isChildNodeOf = (root: ElementAst, childNodeName: string): boolean => {
  const traverseChildNodes = (node: ElementAst): boolean => {
    return node.children.some((childNode) => {
      return childNode instanceof ElementAst && (childNode.name === childNodeName || traverseChildNodes(childNode));
    });
  };

  return traverseChildNodes(root);
};
