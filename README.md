# eslint-plugin-assignment

Eslint plugin to enforce code style of reassignment and update expressions

## Rules

<details>
<summary>no-expression</summary>

Disallow use of reassignments and updates outside statements and voided expressions.

Examples of incorrect code for this rule:

```
const hasChanged = previous === (previous = current);

const setCurrent = (value) => (current = value);
```

Examples of correct code for this rule:

```
const hasChanged = previous === current;
previous = current;

const setCurrent = (value) => void (current = value);
```

This rule conflicts with [no-cond-assign](https://eslint.org/docs/rules/no-cond-assign) and [no-return-assign](https://eslint.org/docs/rules/no-return-assign).
While this rule replaces the core functionality of both it does not offer an `except-parens` option.
</details>

<details>
<summary>compound</summary>

Prefer compound reassignment expressions (e.g. `i += 1`) or verbose assignment expressions (e.g. `i = i + 1`) depending on options.

Set the `prefer` option to select which expressions to prefer. By default "compound" is preferred.

```
  "assignment/compound": ["warn", { "prefer": "compound" }]
```

```
  "assignment/compound": ["warn", { "prefer": "verbose" }]
```

Examples of incorrect code for this rule with `"prefer": "compound"`:

```
i = i + 1;
i = i / 2;
```

Examples of correct code for this rule with `"prefer": "compound"`:

```
i += 1;
i /= 2;

i++;
```

Examples of incorrect code for this rule with `"prefer": "verbose"`:

```
i += 1;
i /= 2;
```

Examples of correct code for this rule with `"prefer": "verbose"`:

```
i = i + 1;
i = i / 2;

i++;
```

This rule does not enforce the use of update expressions (e.g. `i++`). Use the rule `assignment/increment` for that.

This rule can automatically `--fix` violations either way by converting equivalent expressions.
</details>

<details>
<summary>increment</summary>

Prefer compound assignment expressions (e.g. `i += 1`) or update expressions (e.g. `i++`) depending on options.

Set the `prefer` option to select which expressions to prefer. By default "compound" is preferred.

```
  "assignment/compound": ["warn", { "prefer": "compound" }]
```

```
  "assignment/compound": ["warn", { "prefer": "update" }]
```

Examples of incorrect code for this rule with `"prefer": "compound"`:

```
i++;
--i;
```

Examples of correct code for this rule with `"prefer": "compound"`:

```
i += 1;
i -= 1;

i = i + 1;
```

Examples of incorrect code for this rule with `"prefer": "update"`:

```
i += 1;
i -= 1;
```

Examples of correct code for this rule with `"prefer": "update"`:

```
++i;
i--;

i = i + 1;
```

This rule does not enforce the use of non-compound assignment expressions (e.g. `i = i + 1`). Use the rule `assignment/compound` for that.
</details>

## Recommended use

Using assignment expressions outside statements can lead to confusing code or even bugs if the value of the expression is accidentally used. Enforcing `assignment/no-expression` solves that problem and is therefore recommended for all modern JavaScript projects.

`assignment/compound` and `assignment/update` are opinionated and can be used to enforce any preference of syntax. Unless you want to prefer or ban a specific syntax don't enable these rules.

The `recommended` configuration enabled `assignment/no-exression` and disables `assignment/compound` and `assignment/update`.
