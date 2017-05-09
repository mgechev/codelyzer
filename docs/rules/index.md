---
layout: page
title: Codelyzer core rules
permalink: /rules/
menu: main
order: 2
---

Lint _rules_ encode logic for syntactic & semantic checks of TypeScript, HTML, CSS and Angular expressions source code.

## TypeScript-specific

_These rules find errors related to TypeScript or Angular features_:

{% include rule_list.html ruleType="typescript" %}

### Functionality

_These rules catch common errors in JS programming or otherwise confusing constructs that are prone to producing bugs_:

{% include rule_list.html ruleType="functionality" %}

### Maintainability

_These rules make code maintenance easier_:

{% include rule_list.html ruleType="maintainability" %}

### Style

_These rules enforce consistent style across your codebase_:

{% include rule_list.html ruleType="style" %}
