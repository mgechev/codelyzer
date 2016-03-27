import {assertFailure, assertSuccess} from './testHelper';

describe('output-property-directive', () => {
    describe('invalid directive output property', () => {
        it(`should fail, when a directive output property is renamed`, () => {
            let source = `
            class ButtonComponent {
                @Output('changeEvent') change = new EventEmitter<any>();
            }`;
            assertFailure('output-property-directive', source, {
                message: 'In the class "ButtonComponent", the directive output property "change" should not be renamed.'+
                'Please, consider the following use "@Output() change = new EventEmitter();"',
                startPosition: {
                    line: 2,
                    character: 16
                },
                endPosition: {
                    line: 2,
                    character: 72
                }
            });
        });
    });
    describe('valid directive output property', () => {
        it('should succeed, when a directive output property is properly used', () => {
            let source = `
            class ButtonComponent {
               @Output() change = new EventEmitter<any>();
            }`;
            assertSuccess('output-property-directive', source);
        });
        it('should succeed, when a directive output property rename is the same as the property name', () => {
            let source = `
            class ButtonComponent {
               @Output('change') change = new EventEmitter<any>();
            }`;
            assertSuccess('output-property-directive', source);
        });
    });
});
