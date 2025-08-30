/**
 * JSX Syntax Validator - Prevents JSX/CSS syntax errors that cause silent failures
 * Detects missing braces, unclosed tags, malformed styles, and common syntax issues
 */

export interface JSXValidationResult {
  isValid: boolean;
  correctedCode?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Validates JSX syntax and CSS-in-JS patterns
 */
export function validateJSXSyntax(code: string): JSXValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let correctedCode = code;

  // 1. Check for missing opening braces in style attributes
  const styleBraceRegex = /style=\s*([^{][^>]*?)>/g;
  let braceMatch;
  
  while ((braceMatch = styleBraceRegex.exec(code)) !== null) {
    const styleContent = braceMatch[1].trim();
    
    // If it looks like CSS properties without braces
    if (styleContent.includes(':') && !styleContent.startsWith('{')) {
      errors.push(`Missing opening brace in style: style={${styleContent}}`);
      correctedCode = correctedCode.replace(
        `style=${styleContent}>`,
        `style={{${styleContent}}}>`
      );
    }
  }

  // 2. Check for unmatched braces in JSX
  const braceStack: number[] = [];
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : '';
    
    // Handle string literals
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    // Count braces outside strings
    if (!inString) {
      if (char === '{') {
        braceStack.push(i);
      } else if (char === '}') {
        if (braceStack.length === 0) {
          errors.push(`Unmatched closing brace at position ${i}`);
        } else {
          braceStack.pop();
        }
      }
    }
  }
  
  if (braceStack.length > 0) {
    errors.push(`${braceStack.length} unmatched opening brace(s)`);
  }

  // 3. Check for malformed CSS properties
  const cssPropertyRegex = /style=\{\{([^}]+)\}\}/g;
  let cssMatch;
  
  while ((cssMatch = cssPropertyRegex.exec(code)) !== null) {
    const cssContent = cssMatch[1];
    
    // Check for missing commas between properties
    const properties = cssContent.split(',');
    for (const prop of properties) {
      const trimmed = prop.trim();
      if (trimmed && !trimmed.includes(':')) {
        warnings.push(`Malformed CSS property: "${trimmed}" (missing colon?)`);
      }
      
      // Check for JavaScript variables without quotes
      if (trimmed.includes('$') && !trimmed.startsWith('`')) {
        warnings.push(`Template literal may need backticks: "${trimmed}"`);
      }
    }
  }

  // 4. Check for unclosed JSX tags
  const tagRegex = /<(\w+)(?:\s[^>]*)?(?:\s*\/\s*>|>)/g;
  const openTags: string[] = [];
  const selfClosingTags = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);
  
  let tagMatch;
  while ((tagMatch = tagRegex.exec(code)) !== null) {
    const fullMatch = tagMatch[0];
    const tagName = tagMatch[1];
    
    if (fullMatch.endsWith('/>')) {
      // Self-closing tag - OK
      continue;
    } else if (selfClosingTags.has(tagName.toLowerCase())) {
      // Should be self-closing
      warnings.push(`Tag <${tagName}> should be self-closing: <${tagName} />`);
    } else {
      // Opening tag - check for matching closing tag
      const closingTagRegex = new RegExp(`<\/${tagName}>`, 'g');
      const closingMatches = [...code.matchAll(closingTagRegex)];
      
      if (closingMatches.length === 0) {
        errors.push(`Unclosed tag: <${tagName}>`);
      }
    }
  }

  // 5. Check for React/TypeScript syntax issues
  const reactIssues = [
    {
      pattern: /class=/g,
      issue: 'Use className instead of class in JSX',
      fix: 'className='
    },
    {
      pattern: /for=/g,
      issue: 'Use htmlFor instead of for in JSX',
      fix: 'htmlFor='
    },
    {
      pattern: /style="[^"]*"/g,
      issue: 'Use style={{}} object instead of style string',
      fix: 'Convert to CSS-in-JS object'
    }
  ];

  for (const issue of reactIssues) {
    if (issue.pattern.test(code)) {
      errors.push(issue.issue);
      if (typeof issue.fix === 'string') {
        correctedCode = correctedCode.replace(issue.pattern, issue.fix);
      }
    }
  }

  // 6. Check for interpolation in JSX without proper escaping
  const interpolationRegex = /\${[^}]*}/g;
  let interpolationMatch;
  
  while ((interpolationMatch = interpolationRegex.exec(code)) !== null) {
    const context = code.substring(
      Math.max(0, interpolationMatch.index - 20),
      Math.min(code.length, interpolationMatch.index + interpolationMatch[0].length + 20)
    );
    
    // If interpolation is not in a template literal
    if (!context.includes('`')) {
      warnings.push(`Template literal interpolation outside backticks: ${interpolationMatch[0]}`);
    }
  }

  return {
    isValid: errors.length === 0,
    correctedCode: errors.length > 0 ? correctedCode : undefined,
    errors,
    warnings
  };
}

/**
 * Process JSX code to fix syntax issues
 */
export function processJSXSyntax(code: string): string {
  const validation = validateJSXSyntax(code);
  
  if (validation.correctedCode) {
    return validation.correctedCode;
  }
  
  return code;
}

/**
 * Specific validator for CSS-in-JS style objects
 */
export function validateCSSInJS(cssText: string): {
  isValid: boolean;
  correctedCSS?: string;
  errors: string[];
} {
  const errors: string[] = [];
  let correctedCSS = cssText;

  // Check for missing colons
  const lines = cssText.split(/[,\n]/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.includes(':') && !trimmed.includes('//')) {
      errors.push(`CSS property missing colon: "${trimmed}"`);
    }
  }

  // Check for trailing commas in CSS objects
  if (cssText.includes(',}') || cssText.includes(', }')) {
    correctedCSS = correctedCSS.replace(/,(\s*})/g, '$1');
  }

  // Check for kebab-case properties (should be camelCase in React)
  const kebabCaseRegex = /([a-z]+-[a-z]+)\s*:/g;
  let kebabMatch;
  
  while ((kebabMatch = kebabCaseRegex.exec(cssText)) !== null) {
    const kebabCase = kebabMatch[1];
    const camelCase = kebabCase.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    
    errors.push(`Use camelCase in CSS-in-JS: ${kebabCase} → ${camelCase}`);
    correctedCSS = correctedCSS.replace(kebabCase, camelCase);
  }

  return {
    isValid: errors.length === 0,
    correctedCSS: errors.length > 0 ? correctedCSS : undefined,
    errors
  };
}

/**
 * Template for safe CSS-in-JS usage
 */
export const SAFE_CSS_TEMPLATE = `
// ✅ CORRECT CSS-in-JS syntax:
style={{
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#ffffff',
  fontSize: '24px'
}}

// ❌ INCORRECT syntax that causes errors:
style={
  position: 'absolute',  // Missing outer braces
  left: '50%'
}

style="position: absolute; left: 50%"  // String instead of object
style={{ background-color: '#fff' }}  // kebab-case instead of camelCase
`;