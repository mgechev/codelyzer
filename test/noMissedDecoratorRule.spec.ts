import {assertFailure, assertSuccess} from './testHelper';

describe('no-missed-decorator', () => {
    describe('invalid use of class ', () => {
        it(`should fail, when no decorator is used`, () => {
            let source = `class App {}`;
            assertFailure('no-missed-decorator', source, {
                message: 'In the class "App" no valid decorator is used. Probably you should use the @Injectable decorator',
                startPosition: {
                    line: 0,
                    character: 0
                },
                endPosition: {
                    line: 0,
                    character: 12
                }
            });
        });
        it(`should fail, when no valid decorator is used`, () => {
            let source = `
            @MistakenDecorator({
            })
            class App {}`;
            assertFailure('no-missed-decorator', source, {
                message: 'In the class "App" no valid decorator is used. Probably you should use the @Injectable decorator',
                startPosition: {
                    line: 1,
                    character: 12
                },
                endPosition: {
                    line: 3,
                    character: 24
                }
            });
        });
    });
    describe('valid use of class with decorators', () => {
        it('should succeed, when a class is used with @Component decorator', () => {
            let source = `
            @Component({
              selector: 'sg-my-component',
            })
            class App {}`;
            assertSuccess('no-missed-decorator', source);
        });
        it('should succeed, when a class is used with @Directive decorator', () => {
            let source = `
            @Directive({
                selector: '[sgMyDirective]'
            })
            class App {}`;
            assertSuccess('no-missed-decorator', source);
        });
        it('should succeed, when a class is used with @Pipe decorator', () => {
            let source = `
            @Pipe({
            name: 'ng-my-pipe'
            })
            class App {}`;
            assertSuccess('no-missed-decorator', source);
        });
        it('should succeed, when a class is used with @Injectable decorator', () => {
            let source = `
            @Injectable()
            class App {}`;
            assertSuccess('no-missed-decorator', source);
        });
        it('should succeed, when a class is used with multiple decorators', () => {
            let source = `
            @Component({
                selector: 'company'
            })
            @RouteConfig([
                new AsyncRoute({
                    path: '/jobposts',
                    loader: ()=>System.import('./typescripts/app/company/load_job_post').then(m=>m.JobPostComponent),
                    name: 'Jobposts',
                    useAsDefault: true
                }),
                {
                    path: '/publish',
                    component:JobPostFormComponent,
                    name: 'Publish'
                },
                new AsyncRoute({
                    path: '/candidates',
                    loader: ()=>System.import('./typescripts/app/company/load_applied_candidates').then(m=>m.AppliedCandidatesComponent),
                    name: 'Candidates'
                }),
                new AsyncRoute({
                    path: '/profile',
                    loader: ()=>System.import('./typescripts/app/company/company_profile_form').then(m=>m.CompanyFormComponent),
                    name: 'Profile'
                })
            ])
            @View({
                templateUrl: './typescripts/app/templates/company/company_navigation_temp.html',
                directives: [ROUTER_DIRECTIVES],
            })

            class CompanyNavigation {
                constructor() {
                }
            }`;
            assertSuccess('no-missed-decorator', source);
        });
    });
});
