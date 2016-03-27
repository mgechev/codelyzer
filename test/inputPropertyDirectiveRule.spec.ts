import {assertFailure, assertSuccess} from './testHelper';

describe('input-property-directive', () => {
    describe('invalid directive input property', () => {
        it(`should fail, when a directive input property is renamed`, () => {
            let source = `
            class ButtonComponent {
                @Input('labelAttribute') label: string;
            }`;
            assertFailure('input-property-directive', source, {
                message: 'In the class "ButtonComponent", the directive input property "label" should not be renamed.' +
                'Please, consider the following use "@Input() label: string"',
                startPosition: {
                    line: 2,
                    character: 16
                },
                endPosition: {
                    line: 2,
                    character: 55
                }
            });
        });
    });
    describe('valid directive input property', () => {
        it('should succeed, when a directive input property is properly used', () => {
            let source = `
            class ButtonComponent {
              @Input() label: string;
            }`;
            assertSuccess('input-property-directive', source);
        });
        it('should succeed, when a directive input property rename is the same as the name of the property', () => {
            let source = `
            class ButtonComponent {
              @Input('label') label: string;
            }`;
            assertSuccess('input-property-directive', source);
        });
    });
});
