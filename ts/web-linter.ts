import * as ts from 'typescript';

import * as Linter from 'tslint/lib/lint';
import { EnableDisableRulesWalker } from 'tslint/lib/enableDisableRules';
import { LintResult } from 'tslint/lib/lint';

export class WebLinter {
    public static VERSION = "4.0.0-dev";

    private failures: Linter.RuleFailure[] = [];

    /**
     * Creates a TypeScript program object from a tsconfig.json file path and optional project directory.
     */
    public static createProgram(configFile: string, projectDirectory?: string): ts.Program {
        if (projectDirectory === undefined) {
            const lastSeparator = configFile.lastIndexOf("/");
            if (lastSeparator < 0) {
                projectDirectory = ".";
            } else {
                projectDirectory = configFile.substring(0, lastSeparator + 1);
            }
        }

        const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
        const parseConfigHost = {
            fileExists: () => true,
            readDirectory: ts.sys.readDirectory,
            useCaseSensitiveFileNames: true,
        };
        const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, projectDirectory);
        const host = ts.createCompilerHost(parsed.options, true);
        const program = ts.createProgram(parsed.fileNames, parsed.options, host);

        return program;
    }

    /**
     * Returns a list of source file names from a TypeScript program. This includes all referenced
     * files and excludes declaration (".d.ts") files.
     */
    public static getFileNames(program: ts.Program): string[] {
        return program.getSourceFiles().map(s => s.fileName).filter(l => l.substr(-5) !== ".d.ts");
    }

    public lint(fileName: string, source: string, enabledRules: any): void {
        let sourceFile: ts.SourceFile;

        if (sourceFile === undefined) {
            throw new Error(`Invalid source file: ${fileName}. Ensure that the files supplied to lint have a .ts or .tsx extension.`);
        }

        // walk the code first to find all the intervals where rules are disabled
        const rulesWalker = new EnableDisableRulesWalker(sourceFile, {
            disabledIntervals: [],
            ruleName: '',
        });
        rulesWalker.walk(sourceFile);
        const enableDisableRuleMap = rulesWalker.enableDisableRuleMap;

        for (let rule of enabledRules) {
            let ruleFailures: Linter.RuleFailure[] = [];
            if (rule instanceof Linter.Rules.TypedRule) {
                console.error('Does not support TypedRules');
            } else {
                ruleFailures = rule.apply(sourceFile);
            }
            for (let ruleFailure of ruleFailures) {
                if (!this.containsRule(this.failures, ruleFailure)) {
                    this.failures.push(ruleFailure);
                }
            }
        }
    }

    public getResult(): LintResult {
        const formatter = new Linter.Formatters.JsonFormatter();
        const output = formatter.format(this.failures);

        return {
            failureCount: this.failures.length,
            failures: this.failures,
            format: 'json',
            output,
        };
    }

    private containsRule(rules: Linter.RuleFailure[], rule: Linter.RuleFailure) {
        return rules.some((r) => r.equals(rule));
    }
}
