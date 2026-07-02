---
name: react-testing
description: "Write unit and functional tests for a React codebase. Use this skill when writing, reviewing, or fixing tests for React components, custom hooks, utility functions, or async data flows. Covers Vitest + React Testing Library, mocking strategies, and test structure conventions."
---

Tests verify behavior, not implementation. A test that breaks when you rename a variable but not when the feature stops working is worse than no test.

**Core principle**: test what the user experiences and what the system guarantees — not how the code is structured internally.

## Test taxonomy

| Type | What it tests | Scope | Tools |
|------|--------------|-------|-------|
| **Unit** | A pure function, a custom hook, a utility | Isolated, no DOM | Vitest |
| **Component** | A component's rendered output and interactions | Shallow DOM, no network | Vitest + RTL |
| **Functional / Integration** | A user flow across multiple components | Full subtree, mocked network | Vitest + RTL + MSW |

**Decision rule:**
- Logic with no UI → unit test
- Component rendering and user interaction → component test
- Multi-step user flow (form submission, data fetch → display, navigation) → functional test

Never use snapshot tests as a substitute for behavioral assertions. Snapshots are acceptable only for intentionally static output (e.g., generated SVG, serialized tokens).

---

## Tooling

| Tool | Role |
|------|------|
| **Vitest** | Test runner and assertion library |
| **React Testing Library (RTL)** | Render components and query the DOM |
| **@testing-library/user-event** | Simulate realistic user interactions |
| **MSW (Mock Service Worker)** | Intercept and mock HTTP requests |
| **vi.mock / vi.fn** | Mock modules, functions, and timers |

Use `userEvent` over `fireEvent` for all user interactions — it simulates the full browser event sequence (pointerdown → mousedown → focus → input → mouseup → click), catching bugs that `fireEvent` misses.

```ts
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: /submit/i }))
await user.type(screen.getByLabelText(/email/i), 'user@example.com')
```

---

## File conventions

```
src/
  components/
    Button/
      Button.tsx
      __tests__/
        Button.test.tsx       ← component test
  hooks/
    useCart/
      useCart.ts
      __tests__/
        useCart.test.ts       ← unit test
  utils/
    formatDate.ts
    __tests__/
      formatDate.test.ts      ← unit test
  features/
    Checkout/
      __tests__/
        CheckoutFlow.test.tsx ← functional test
```

- Test files: `[filename].test.ts(x)` in a `__tests__` folder next to the source
- Use `@/` prefix for all imports (not relative paths)
- One `describe` block per file, named after the unit under test

---

## Query priority (RTL)

Always use the most semantically meaningful query. This order mirrors how real users and assistive technologies perceive the UI:

1. `getByRole` — preferred for interactive elements and landmarks
2. `getByLabelText` — preferred for form inputs
3. `getByPlaceholderText` — fallback for inputs without a label (fix the accessibility issue too)
4. `getByText` — for non-interactive text content
5. `getByDisplayValue` — for pre-filled form values
6. `getByAltText` — for images
7. `getByTitle` — rarely needed
8. `getByTestId` — **last resort only**, when no semantic query is possible

```ts
// ✅ Correct
screen.getByRole('button', { name: /add to cart/i })
screen.getByLabelText(/email address/i)

// ❌ Avoid
screen.getByTestId('submit-btn')
container.querySelector('.btn-primary')
```

---

## Test structure

Every test follows **Arrange → Act → Assert**. Keep each test focused on one behavior.

```ts
describe('LoginForm', () => {
  it('shows a validation error when email is empty and form is submitted', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<LoginForm onSuccess={vi.fn()} />)

    // Act
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i)
  })
})
```

Rules:
- One assertion per logical behavior (multiple `expect` calls are fine if they describe the same outcome)
- Test description uses plain English: `it('does X when Y')`
- No logic (loops, conditionals) inside tests — extract to helpers if setup is complex
- Shared setup goes in `beforeEach`, not copy-pasted

---

## What to cover

### Component tests

| Scenario | What to assert |
|----------|---------------|
| Default render | Key elements are present (`toBeInTheDocument`) |
| Conditional rendering | Element appears/disappears based on props or state |
| User interaction | Correct callback called, correct state change visible |
| Loading state | Skeleton/spinner present, submit button disabled |
| Error state | Error message visible, recovery action available |
| Empty state | Empty state UI shown, not a blank screen |
| Disabled state | Element has `disabled` attribute or `aria-disabled="true"` |

### Async flows (data fetching)

Use MSW to mock HTTP. Never mock `fetch` or `axios` directly.

```ts
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'

it('displays products after successful fetch', async () => {
  server.use(
    http.get('/api/products', () =>
      HttpResponse.json([{ id: 1, name: 'Widget' }])
    )
  )

  render(<ProductList />)

  expect(screen.getByRole('status')).toBeInTheDocument() // loading indicator

  expect(await screen.findByText('Widget')).toBeInTheDocument()
})

it('shows an error message when the fetch fails', async () => {
  server.use(
    http.get('/api/products', () => HttpResponse.error())
  )

  render(<ProductList />)

  expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load/i)
})
```

### Custom hooks

Use `renderHook` from RTL for hooks that manage state or side effects.

```ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

describe('useCounter', () => {
  it('increments the count', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => result.current.increment())

    expect(result.current.count).toBe(1)
  })
})
```

For hooks that require a context provider, pass it as the `wrapper` option:

```ts
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)
const { result } = renderHook(() => useCart(), { wrapper })
```

### Pure functions and utilities

No RTL needed. Test with plain Vitest:

```ts
import { formatCurrency } from '@/utils/formatCurrency'

describe('formatCurrency', () => {
  it('formats a positive integer', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00')
  })

  it('returns "—" for null or undefined', () => {
    expect(formatCurrency(null, 'EUR')).toBe('—')
    expect(formatCurrency(undefined, 'EUR')).toBe('—')
  })
})
```

---

## Mocking strategies

### Modules (`vi.mock`)

```ts
vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}))
```

Use for: third-party SDKs, browser APIs (`window.matchMedia`), modules with side effects.  
Do **not** use to mock your own components or business logic — that hides real bugs.

### Timers (`vi.useFakeTimers`)

```ts
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('hides the toast after 3 seconds', () => {
  render(<Toast message="Saved" />)
  expect(screen.getByRole('status')).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(3000))

  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
```

### Context and providers

Wrap with a real provider, not a mock one, unless the provider makes network calls:

```ts
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>
  )
}
```

Create this helper once in `src/test-utils.tsx` and re-export `render` and `screen` from it.

---

## Anti-patterns — with their fix

| Anti-pattern | Why it's a problem | Fix |
|---|---|---|
| Testing implementation details (state variable names, internal methods) | Breaks on refactoring, doesn't verify behavior | Test what the user sees or what is returned to the caller |
| `getByTestId` as default query | Doesn't validate accessibility or semantics | Use `getByRole`, `getByLabelText` first |
| Mocking `fetch` or `axios` directly | Doesn't test the full request/response cycle, leaks between tests | Use MSW |
| Asserting on exact strings (copy can change) | Brittle tests that break on copy updates | Use `/regex/i` or `{ name: /partial/i }` |
| Empty `catch` in async tests | Silently passes on thrown errors | Always `await` and let errors propagate, or use `expect(...).rejects` |
| `fireEvent` instead of `userEvent` | Misses focus, blur, pointer events | Always use `userEvent.setup()` |
| One giant test per component | Hard to diagnose failures | One `it` per behavior |
| Snapshot everything | Snapshots become outdated noise | Only snapshot genuinely static output |
| Not cleaning up mocks between tests | State leaks between tests causing flakiness | Use `afterEach(() => server.resetHandlers())` and `vi.clearAllMocks()` |

---

## Definition of Done

A test suite is considered complete when **all** of the following are true:

- [ ] Default render, loading, empty, error, and success states are each tested
- [ ] Every user-facing interaction (click, type, submit, keyboard) has a corresponding test
- [ ] Async flows use MSW — no direct `fetch`/`axios` mocks
- [ ] Custom hooks are tested with `renderHook`
- [ ] Pure functions cover happy paths + null/undefined + boundary values
- [ ] No `getByTestId` without a comment justifying why no semantic query works
- [ ] MSW handlers are reset in `afterEach`; `vi.clearAllMocks()` runs in `afterEach`
- [ ] Tests pass in isolation (no shared mutable state between tests)
- [ ] No test asserts on implementation details (internal state, private methods, CSS class names)
