import { IOptions, IRule } from 'tslint';
import * as fs from 'fs';
import * as path from 'path';

export function convertRuleOptions(ruleConfiguration: Map<string, Partial<IOptions>>): IOptions[] {
  const output: IOptions[] = [];
  ruleConfiguration.forEach(({ ruleArguments, ruleSeverity }, ruleName) => {
    const options: IOptions = {
      disabledIntervals: [], // deprecated, so just provide an empty array.
      ruleArguments: ruleArguments || [],
      ruleName,
      ruleSeverity: ruleSeverity || 'error'
    };
    output.push(options);
  });
  return output;
}

const cachedRules = new Map<string, any | 'not-found'>();

export function camelize(stringWithHyphens: string): string {
  return stringWithHyphens.replace(/-(.)/g, (_, nextLetter) => (nextLetter as string).toUpperCase());
}

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
  const fullPath = path.join(directory, ruleName);
  if (fs.existsSync(`${fullPath}.js`)) {
    const ruleModule = require(fullPath) as { Rule: any } | undefined;
    if (ruleModule !== undefined) {
      return ruleModule.Rule;
    }
  }
  return 'not-found';
}

export function getRelativePath(directory?: string | null, relativeTo?: string) {
  if (directory !== null && directory !== undefined) {
    const basePath = relativeTo !== undefined ? relativeTo : process.cwd();

    return path.resolve(basePath, directory);
  }

  return undefined;
}

export function arrayify<T>(arg?: T | T[]): T[] {
  if (Array.isArray(arg)) {
    return arg;
  } else if (arg !== null && arg !== undefined) {
    return [arg];
  }

  return [];
}

function loadCachedRule(directory: string, ruleName: string, isCustomPath?: boolean): any | undefined {
  // use cached value if available
  const fullPath = path.join(directory, ruleName);
  const cachedRule = cachedRules.get(fullPath);
  if (cachedRule !== undefined) {
    return cachedRule === 'not-found' ? undefined : cachedRule;
  }

  // get absolute path
  let absolutePath: string | undefined = directory;
  if (isCustomPath) {
    absolutePath = getRelativePath(directory);
    if (absolutePath !== undefined && !fs.existsSync(absolutePath)) {
      throw new Error(`Could not find custom rule directory: ${directory}`);
    }
  }

  const Rule = absolutePath === undefined ? 'not-found' : loadRule(absolutePath, ruleName);

  cachedRules.set(fullPath, Rule);
  return Rule === 'not-found' ? undefined : Rule;
}

export function find<T, U>(inputs: T[], getResult: (t: T) => U | undefined): U | undefined {
  for (const element of inputs) {
    const result = getResult(element);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
}

function findRule(name: string, rulesDirectories?: string | string[]): any | undefined {
  const camelizedName = transformName(name);

  return find(arrayify(rulesDirectories), dir => loadCachedRule(dir, camelizedName, true));
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
