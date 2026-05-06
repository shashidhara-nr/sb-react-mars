import type { RegisterOptions } from 'react-hook-form';

export type NonTransactionalAuthRuleFormValues = {
  authRuleName?: string;
  authRuleDescription?: string;
  authRuleConstruct?: string;
  selectedClass?: string;
};

export const REQUIRED_FIELDS = new Set<keyof NonTransactionalAuthRuleFormValues>([
  'authRuleName',
]);

export const messages = {
  required: {
    authRuleName: 'Please enter an authorisation rule name',
    authRuleDescription: 'Please enter an authorisation rule description',
    authRuleConstruct: 'Please enter an authorisation rule construct',
    selectedClass: 'Please select a class',
  } as Record<string, string>,
  lengths: {
    authRuleNameMax: 'Authorisation rule name must not exceed 100 characters',
    authRuleDescriptionMax: 'Authorisation rule description must not exceed 300 characters',
    authRuleConstructMax: 'Authorisation rule construct must not exceed 2000 characters',
  } as Record<string, string>,
  patterns: {
    alphaNumCode: 'Use letters and numbers only',
  } as Record<string, string>,
  // Legacy parser-style validation messages (kept in sync with err.properties)
  syntax: {
    authRuleInvalidSelectionForDifferentClassOperands:
      'A combination of authorisation classes with both “AND” and “OR” operands without brackets is not allowed.',
    expectedAuthClassOrBracket: 'Expected authorisation class or "(".',
    expectedEndQuote: 'An end quote (") is missing from an authorization class name.',
    expectedCloseBracket: 'Expected ")".',
    expectedAndOrOrEOF: 'Expected either AND, OR, or the end of input.',
    unknownAuthClass: 'Unknown authorisation class: [0].',
    expectedBracket: 'Expected "(".',
    unexpectedCloseBracket: 'Unexpected )',
  } as Record<string, string>,
};

const re = {
  alphaNum: /^[a-zA-Z0-9_\s-]+$/,
};

function validateConstructSyntax(raw: string): string[] {
  const value = String(raw ?? '').trim();
  const issues: string[] = [];
  if (!value) return issues;

  type Token =
    | { type: 'LPAREN' | 'RPAREN' | 'THEN' | 'AND' | 'OR' }
    | { type: 'CLASS'; value: string }
    | { type: 'UNKNOWN'; value: string };

  const tokens: Token[] = [];
  let maxDepth = 0;
  let containsAnd = false;
  let containsOr = false;
  let missingEndQuote = false;

  // Tokenizer: supports quoted class names, parentheses, and AND/OR.
  for (let i = 0; i < value.length; ) {
    const ch = value[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN' });
      i++;
      continue;
    }

    if (ch === '"') {
      let j = i + 1;
      let foundEnd = false; 
      while (j < value.length) {
        if (value[j] === '"') {
          foundEnd = true;
          break;
        }
        j++;
      }
      if (!foundEnd) {
        // Don't return early; we still want to report follow-on issues like
        // missing close bracket / incomplete operand, to match legacy behaviour.
        missingEndQuote = true;
        break;
      }
      const className = value.slice(i + 1, j);
      tokens.push({ type: 'CLASS', value: className });
      i = j + 1;
      continue;
    }

    // Word token
    const wordMatch = value.slice(i).match(/^[A-Za-z]+/);
    if (wordMatch) {
      const word = wordMatch[0];
      const upper = word.toUpperCase();
      if (upper === 'THEN') tokens.push({ type: 'THEN' });
      else if (upper === 'AND') {
        containsAnd = true;
        tokens.push({ type: 'AND' });
      } else if (upper === 'OR') {
        containsOr = true;
        tokens.push({ type: 'OR' });
      }
      else tokens.push({ type: 'UNKNOWN', value: word });
      i += word.length;
      continue;
    }

    // Any other character -> unknown
    tokens.push({ type: 'UNKNOWN', value: ch });
    i++;
  }

  if (tokens.length === 0) return issues;

  // Parser: validates ordering and bracket balance.
  // Grammar enforced here (strict):
  //   Operand := '(' CLASS ')'
  //   Expr := Operand ( (THEN|AND|OR) Operand )*
  let depth = 0;
  let expectingOperand = true;
  let expectingClassAfterLParen = false;
  let expectingRParenAfterClass = false;

  const pushIssueOnce = (msg: string) => {
    if (!issues.includes(msg)) issues.push(msg);
  };

  for (const token of tokens) {
    if (expectingOperand) {
      if (token.type === 'LPAREN') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
        expectingOperand = false;
        expectingClassAfterLParen = true;
        continue;
      }

      if (token.type === 'RPAREN') {
        pushIssueOnce(messages.syntax.expectedBracket);
        pushIssueOnce(messages.syntax.unexpectedCloseBracket);
        return issues;
      }
      if (token.type === 'THEN' || token.type === 'AND' || token.type === 'OR') {
        pushIssueOnce(messages.syntax.expectedBracket);
        return issues;
      }

      // UNKNOWN while expecting operand
      pushIssueOnce(messages.syntax.expectedBracket);
      return issues;
    }

    if (expectingClassAfterLParen) {
      if (token.type === 'CLASS') {
        expectingClassAfterLParen = false;
        expectingRParenAfterClass = true;
        continue;
      }
      if (token.type === 'LPAREN') {
        // Nested grouping bracket.
        depth++;
        maxDepth = Math.max(maxDepth, depth);
        // still expecting a class after the latest '('
        expectingClassAfterLParen = true;
        expectingRParenAfterClass = false;
        continue;
      }
      if (token.type === 'RPAREN') {
        pushIssueOnce(messages.syntax.expectedAuthClassOrBracket);
        pushIssueOnce(messages.syntax.unexpectedCloseBracket);
        return issues;
      }
      pushIssueOnce(messages.syntax.expectedAuthClassOrBracket);
      return issues;
    }

    if (expectingRParenAfterClass) {
      if (token.type === 'RPAREN') {
        depth--;
        if (depth < 0) {
          pushIssueOnce(messages.syntax.unexpectedCloseBracket);
          return issues;
        }
        expectingRParenAfterClass = false;
        // operand finished -> now expecting operator/close/end
        continue;
      }
      pushIssueOnce(messages.syntax.expectedCloseBracket);
      return issues;
    }

    // expecting operator / close / end
    if (token.type === 'THEN' || token.type === 'AND' || token.type === 'OR') {
      expectingOperand = true;
      continue;
    }
    if (token.type === 'RPAREN') {
      depth--;
      if (depth < 0) {
        pushIssueOnce(messages.syntax.unexpectedCloseBracket);
        return issues;
      }
      expectingOperand = false;
      continue;
    }
    if (token.type === 'LPAREN' || token.type === 'CLASS') {
      pushIssueOnce(messages.syntax.expectedAndOrOrEOF);
      return issues;
    }

    // UNKNOWN while expecting operator
    pushIssueOnce(messages.syntax.expectedAndOrOrEOF);
    return issues;
  }

  // Incomplete trailing constructs (e.g. ends with '(' or ends after a class).
  if (expectingClassAfterLParen) {
    pushIssueOnce(messages.syntax.expectedAuthClassOrBracket);
  }
  if (missingEndQuote) {
    pushIssueOnce(messages.syntax.expectedEndQuote);
  }
  if (expectingRParenAfterClass) {
    pushIssueOnce(messages.syntax.expectedCloseBracket);
  }

  if (expectingOperand) {
    // Expression ends with operator
    pushIssueOnce(messages.syntax.expectedBracket);
  }
  if (depth > 0) {
    pushIssueOnce(messages.syntax.expectedCloseBracket);
  }

  // Rule: using both AND and OR at the same precedence requires grouping brackets.
  // Because each class operand is already wrapped in ("Class"), we interpret “without brackets”
  // as: no additional grouping parentheses beyond operand parentheses.
  if (containsAnd && containsOr && maxDepth <= 1) {
    pushIssueOnce(messages.syntax.authRuleInvalidSelectionForDifferentClassOperands);
  }

  return issues;
}

export function validateField(
  name: keyof NonTransactionalAuthRuleFormValues,
  value: unknown,
  _allValues?: NonTransactionalAuthRuleFormValues,
): true | string {
  const v = value as string | undefined | null;

  if (REQUIRED_FIELDS.has(name)) {
    const msg = messages.required[name as string] ?? 'This field is required';
    const isEmpty = v === undefined || v === null || v === '' || String(v).trim() === '';
    if (isEmpty) return msg;
  }

  switch (name) {
    case 'authRuleName': {
      if (v && String(v).length > 100) return messages.lengths.authRuleNameMax;
      if (v && !re.alphaNum.test(String(v))) return messages.patterns.alphaNumCode;
      return true;
    }
    case 'authRuleDescription': {
      if (v && String(v).length > 300) return messages.lengths.authRuleDescriptionMax;
      return true;
    }
    case 'authRuleConstruct': {
      if (!v || String(v).trim() === '') return messages.required.authRuleConstruct;
      if (v && String(v).length > 2000) return messages.lengths.authRuleConstructMax;

      const syntaxIssues = validateConstructSyntax(String(v));
      if (syntaxIssues.length > 0) {
        return `Errors found: ${syntaxIssues.length} ${syntaxIssues
          .map((msg, i) => `${i + 1}. ${msg}`)
          .join(' ')}`;
      }
      return true;
    }
    case 'selectedClass': {
      if (!v || String(v).trim() === '') return messages.required.selectedClass;
      return true;
    }
    default:
      return true;
  }
}

export function getRulesForField<Name extends keyof NonTransactionalAuthRuleFormValues>(
  name: Name,
  getAllValues?: () => NonTransactionalAuthRuleFormValues,
  isRequired: boolean = true,
): RegisterOptions<NonTransactionalAuthRuleFormValues, Name> {
  const rules: RegisterOptions<NonTransactionalAuthRuleFormValues, Name> = {
    validate: (val: unknown) => validateField(name, val, getAllValues?.()),
  };

  if (isRequired && REQUIRED_FIELDS.has(name)) {
    rules.required = messages.required[name as string] ?? 'This field is required';
  }

  if (name === 'authRuleName') {
    rules.maxLength = { value: 100, message: messages.lengths.authRuleNameMax };
  }
  if (name === 'authRuleDescription') {
    rules.maxLength = { value: 300, message: messages.lengths.authRuleDescriptionMax };
  }

  return rules;
}

const NonTransactionalAuthRuleCreateLogic = {
  REQUIRED_FIELDS,
  messages,
  validateField,
  getRulesForField,
};

export default NonTransactionalAuthRuleCreateLogic;
