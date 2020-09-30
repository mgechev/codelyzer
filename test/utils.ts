import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { IOptions, IRule } from 'tslint';
import { arrayify, camelize, find } from 'tslint/lib/utils';

export function convertRuleOptions(ruleConfiguration: Map<string, Partial<IOptions>>): IOptions[] {
  const output: IOptions[] = [];
  ruleConfiguration.forEach(({ ruleArguments, ruleSeverity }, ruleName) => {
    const options: IOptions = {
      disabledIntervals: [], // deprecated, so just provide an empty array.
      ruleArguments: ruleArguments || [],
      ruleName,
      ruleSeverity: ruleSeverity || 'error',
    };
    output.push(options);
  });
  return output;
}

const cachedRules = new Map<string, any | 'not-found'>();

function transformName(name: string): string {
  // camelize strips out leading and trailing underscores and dashes, so make sure they aren't passed to camelize
  // the regex matches the groups (leading underscores and dashes)(other characters)(trailing underscores and dashes)
  const nameMatch = name.match(/^([-_]*)(.*?)([-_]*)$/);
  if (nameMatch === null) {
    return `${name}Rule`;
  }
  return `${nameMatch[1]}${camelize(nameMatch[2])}${nameMatch[3]}Rule`;
}

/**
 * @param directory - An absolute path to a directory of rules
 * @param ruleName - A name of a rule in filename format. ex) "someLintRule"
 */
function loadRule(directory: string, ruleName: string): any | 'not-found' {
  const fullPath = join(directory, ruleName);
  if (existsSync(`${fullPath}.js`)) {
    const ruleModule = require(fullPath) as { Rule: any } | undefined;
    if (ruleModule !== undefined) {
      return ruleModule.Rule;
    }
  }
  return 'not-found';
}

export function getRelativePath(directory?: string | null, relativeTo?: string): string | undefined {
  if (directory !== null && directory !== undefined) {
    const basePath = relativeTo !== undefined ? relativeTo : process.cwd();

    return resolve(basePath, directory);
  }

  return undefined;
}

function loadCachedRule(directory: string, ruleName: string, isCustomPath?: boolean): any | undefined {
  // use cached value if available
  const fullPath = join(directory, ruleName);
  const cachedRule = cachedRules.get(fullPath);
  if (cachedRule !== undefined) {
    return cachedRule === 'not-found' ? undefined : cachedRule;
  }

  // get absolute path
  let absolutePath: string | undefined = directory;
  if (isCustomPath) {
    absolutePath = getRelativePath(directory);
    if (absolutePath !== undefined && !existsSync(absolutePath)) {
      throw new Error(`Could not find custom rule directory: ${directory}`);
    }
  }

  const Rule = absolutePath === undefined ? 'not-found' : loadRule(absolutePath, ruleName);

  cachedRules.set(fullPath, Rule);
  return Rule === 'not-found' ? undefined : Rule;
}

function findRule(name: string, rulesDirectories?: string | string[]): any | undefined {
  const camelizedName = transformName(name);

  return find(arrayify(rulesDirectories), (dir) => loadCachedRule(dir, camelizedName, true));
}

export function loadRules(ruleOptionsList: IOptions[], rulesDirectories?: string | string[], isJs = false): IRule[] {
  const rules: IRule[] = [];
  const notFoundRules: string[] = [];
  const notAllowedInJsRules: string[] = [];

  for (const ruleOptions of ruleOptionsList) {
    if (ruleOptions.ruleSeverity === 'off') {
      // Perf: don't bother finding the rule if it's disabled.
      continue;
    }

    const ruleName = ruleOptions.ruleName;
    const Rule = findRule(ruleName, rulesDirectories);
    if (Rule === undefined) {
      notFoundRules.push(ruleName);
    } else if (isJs && Rule.metadata !== undefined && Rule.metadata.typescriptOnly) {
      notAllowedInJsRules.push(ruleName);
    } else {
      const rule = new Rule(ruleOptions);

      if (rule.isEnabled()) {
        rules.push(rule);
      }
    }
  }

  return rules;
}
