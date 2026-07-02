---
name: code-review
description: "Review code for correctness, maintainability, security, and performance. Use this skill when asked to review a PR, audit a file, or assess code quality. Produces structured, severity-ranked feedback with concrete fixes — not general advice."
---

A code review's job is to catch what automated tools miss: logic errors, wrong abstractions, security gaps, and maintainability traps. Every comment must include a severity, a reason, and a concrete fix.

**Core principle**: flag what must change, suggest what could improve, skip what is purely stylistic (let the linter handle it).

## Severity levels

Label every finding with one of these. It sets expectations and drives prioritization.

| Level | Meaning | Must be fixed before merge? |
|-------|---------|----------------------------|
| 🔴 **Critical** | Bug, data loss, security vulnerability, crash | Yes |
| 🟠 **Major** | Wrong behavior in edge case, significant performance issue, broken abstraction | Yes |
| 🟡 **Minor** | Suboptimal pattern, missing error handling for non-critical path, unclear naming | Recommended |
| 🔵 **Suggestion** | Alternative approach worth considering, readability improvement | No |

Do not use 🔵 Suggestion for issues that will realistically cause a bug or maintenance problem — escalate to 🟡 or above.

---

## Review checklist by category

Go through each category. Only report findings — skip categories with nothing to flag.

### 1. Correctness
- Does the logic match the stated intent? Trace the critical path manually.
- Are all branches handled? Check: null/undefined, empty array/string, 0, negative numbers, concurrent calls.
- Are errors caught at the right level and propagated or handled correctly?
- Are async operations awaited everywhere they need to be? Look for missing `await`, unhandled promise rejections, and race conditions.
- Are side effects (mutations, network calls, writes) triggered exactly once, not on every render or in loops?

### 2. Security (check every time, not just when "relevant")
- **Injection**: is user input ever interpolated into SQL, shell commands, HTML, or eval? If so: 🔴 Critical.
- **Sensitive data**: are secrets, tokens, or PII logged, exposed in error messages, or stored in localStorage?
- **Authentication / Authorization**: are protected routes/actions actually gated? Is the check on the server, not just the client?
- **Dependencies**: are any imported packages known to have vulnerabilities (check against the OWASP Top 10)?
- **Cryptography**: is `Math.random()` used where a CSPRNG is needed? Are passwords hashed with bcrypt/argon2, not MD5/SHA1?

### 3. Maintainability
- Does each function do one thing? A function longer than ~40 lines or with more than 3 levels of nesting is a signal to split.
- Are names honest? A name that requires a comment to explain is a naming problem, not a documentation problem.
- Is logic duplicated across more than one place? Flag it only if it's the same concept — not just similar syntax.
- Are magic numbers and strings extracted to named constants?
- Would a new developer understand what this code does without reading its dependencies?

### 4. Performance
- Are there N+1 query patterns (a fetch/query inside a loop)?
- Are expensive computations (sorts, filters, regex) running on every render/call when they could be memoized or moved?
- Are large payloads fetched when only a subset is used?
- Are event listeners, subscriptions, and timers cleaned up on unmount/teardown?

### 5. Testability
- Is the logic under test actually reachable without mocking the entire world?
- Are side effects (I/O, time, randomness) injected or isolated so they can be controlled in tests?
- Are there existing tests for this code path? If not, flag it as 🟡 Minor.

---

## Output format

Structure every review in this order:

```
## Summary
One paragraph: what the code does, overall quality signal, the most important thing to address.

## Findings

### 🔴 Critical — [short title]
**Location**: `path/to/file.ts`, line 42
**Problem**: Concrete description of what is wrong and what can go wrong as a result.
**Fix**:
\`\`\`ts
// corrected code snippet
\`\`\`

### 🟡 Minor — [short title]
...

## What works well
Two to five specific things done correctly. Be precise — "good error handling on line 78" not "nice code".
```

Rules:
- Lead with the location (file + line), not the category
- Every finding includes a corrected code snippet when the fix is non-obvious
- "What works well" is mandatory — it anchors the review and signals what patterns to keep

---

## Anti-patterns in reviews to avoid

| Anti-pattern | Why it's a problem | Fix |
|---|---|---|
| Vague comment ("this could be cleaner") | Gives no direction | Name the specific issue and show the alternative |
| Flagging style issues the linter should catch | Noise that buries real issues | Only flag what ESLint/Prettier cannot auto-fix |
| Suggesting a full rewrite for a minor issue | Disproportionate, blocks the review | Scope the fix to the minimum necessary change |
| Approving with unresolved 🔴 or 🟠 findings | Ships broken code | Block merge until Critical and Major are resolved |
| Reviewing without understanding the intent | Flags correct code as wrong | Read the PR description or ask before commenting |

---

## Definition of Done

The review is complete when:

- [ ] All five categories have been checked (even if no findings in some)
- [ ] Every finding has a severity label, a location, a reason, and a fix
- [ ] All 🔴 Critical and 🟠 Major findings have a concrete code fix provided
- [ ] "What works well" section is present with at least two specific points
- [ ] No finding is purely stylistic (delegate those to the linter)
