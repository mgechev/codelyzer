import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';

export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: Lint.IRuleMetadata = {
        ruleName: 'no-skipped-test',
        description: 'Disallows `xit` and `xdescribe` function invocations.',
        rationale: Lint.Utils.dedent`
            Using 'xit' or 'xdescribe' causes only a subset of tests to run,
            which can easily go unnoticed and lead to a build passing where
            it should fail.
        `,
        optionsDescription: 'Not configurable.',
        options: null,
        optionExamples: ['true'],
        type: 'functionality',
    };

    public static FAILURE_STRING = 'Skipped tests are not allowed';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoFocusedTestWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
class NoFocusedTestWalker extends Lint.RuleWalker {
    public visitCallExpression(node: ts.CallExpression) {
        // create a failure at the current positionn
        let nodeText = node.getText();
        if (nodeText.indexOf('xit') === 0 || nodeText.indexOf('xdescribe') === 0) {
            this.addFailure(this.createFailure(node.getStart(), 1, Rule.FAILURE_STRING));
        }

        // call the base version of this visitor to actually parse this node
        super.visitCallExpression(node);
    }
}
