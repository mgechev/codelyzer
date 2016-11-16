import * as ts from 'typescript';
export declare const stringDistance: (s: string, t: string, ls?: number, lt?: number) => number;
export declare const isSimpleTemplateString: (e: any) => boolean;
export declare const getDecoratorPropertyInitializer: (decorator: ts.Decorator, name: string) => any;
export declare const getDecoratorName: (decorator: ts.Decorator) => any;
export declare const getComponentDecorator: (declaration: ts.ClassDeclaration) => ts.Decorator;
