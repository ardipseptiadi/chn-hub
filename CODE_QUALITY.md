# Code Quality Checklist & Guidelines

## Runtime Safety Checklist

Before committing any code that handles data from hooks, props, or state, verify:

### Array Operations
- [ ] All `.filter()` calls use optional chaining OR helper function
  ```typescript
  // ✅ GOOD
  const filtered = arr?.filter(x => x.active) || [];
  const filtered = safeFilter(arr, x => x.active);

  // ❌ BAD
  const filtered = arr.filter(x => x.active);
  ```

- [ ] All `.map()` calls use optional chaining OR helper function
  ```typescript
  // ✅ GOOD
  const mapped = arr?.map(x => x.id) || [];
  const mapped = safeMap(arr, x => x.id);

  // ❌ BAD
  const mapped = arr.map(x => x.id);
  ```

- [ ] All `.length` accesses use optional chaining OR helper function
  ```typescript
  // ✅ GOOD
  const count = arr?.length || 0;
  const count = safeLength(arr);

  // ❌ BAD
  const count = arr.length;
  ```

- [ ] All `.sort()` calls use optional chaining OR helper function
  ```typescript
  // ✅ GOOD
  const sorted = arr?.sort((a, b) => ...) || [];
  const sorted = safeSort(arr, (a, b) => ...);

  // ❌ BAD
  const sorted = arr.sort((a, b) => ...);
  ```

### Object Property Access
- [ ] Nested object properties use optional chaining
  ```typescript
  // ✅ GOOD
  const name = user?.profile?.name ?? "Guest";
  const name = safeGet(user, "profile.name", "Guest");

  // ❌ BAD
  const name = user.profile.name;
  ```

- [ ] All potentially undefined settings use nullish coalescing
  ```typescript
  // ✅ GOOD
  const size = settings?.fontSize ?? 16;
  const color = settings?.primaryColor ?? "#6366f1";

  // ❌ BAD
  const size = settings.fontSize;
  ```

### Hook Return Values
- [ ] Check hook documentation for return type
  - `useStoreData` returns `[data, setData]` (tuple)
  - Custom filtered hooks (like `useUserOrders`) return direct array
  ```typescript
  // ✅ GOOD - useStoreData returns tuple
  const [products, setProducts] = useProducts();

  // ✅ GOOD - useUserOrders returns filtered array directly
  const orders = useUserOrders(userId);

  // ❌ BAD - destructuring when hook returns array directly
  const [orders] = useUserOrders(userId);
  ```

### Type Safety
- [ ] Type narrow before accessing object properties
  ```typescript
  // ✅ GOOD
  if (user && user.name) {
    console.log(user.name.length);
  }

  // ❌ BAD
  console.log(user.name.length);
  ```

## Common Patterns to Avoid

### ❌ Pattern 1: Assuming arrays are always defined
```typescript
// DON'T
const items = data.items.map(x => x.name);
```

### ✅ Solution: Use optional chaining with fallback
```typescript
// DO
const items = data?.items?.map(x => x.name) || [];
// OR
const items = safeMap(data?.items, x => x.name);
```

---

### ❌ Pattern 2: Destructuring filtered hook returns
```typescript
// DON'T
const [orders] = useUserOrders(userId);
```

### ✅ Solution: Direct assignment for filtered hooks
```typescript
// DO
const orders = useUserOrders(userId);
```

---

### ❌ Pattern 3: Chaining methods without null checks
```typescript
// DON'T
const result = data.filter(x => x.active).sort((a, b) => a.date - b.date);
```

### ✅ Solution: Safe chain with fallback
```typescript
// DO
const result = safeSort(data?.filter(x => x.active), (a, b) => a.date - b.date);
```

---

### ❌ Pattern 4: Accessing localStorage directly
```typescript
// DON'T
const settings = JSON.parse(localStorage.getItem("settings"));
```

### ✅ Solution: Use safe helper
```typescript
// DO
const settings = safeParseJSON(localStorage.getItem("settings"), defaultSettings);
```

## Safe Helper Functions

Import from `@/lib/safe-helpers`:

| Helper | Purpose | Example |
|--------|---------|---------|
| `safeFilter(arr, fn)` | Safe array filtering | `safeFilter(orders, o => o.active)` |
| `safeMap(arr, fn)` | Safe array mapping | `safeMap(items, i => i.id)` |
| `safeLength(arr)` | Safe array length | `safeLength(orders)` |
| `safeSort(arr, fn)` | Safe array sorting | `safeSort(items, compareFn)` |
| `safeReduce(arr, fn, init)` | Safe array reduction | `safeReduce(nums, add, 0)` |
| `safeFind(arr, fn)` | Safe array find | `safeFind(users, u => u.id)` |
| `safeAt(arr, index)` | Safe index access | `safeAt(items, 0)` |
| `isEmpty(arr)` | Check if array empty | `if (isEmpty(list))` |
| `isArray(value)` | Type guard | `if (isArray<T>(value))` |
| `ensureArray(value)` | Wrap in array | `ensureArray(item)` |
| `safeGet(obj, path, fallback)` | Safe nested access | `safeGet(user, "profile.name", "")` |
| `safeCall(fn, fallback)` | Safe function call | `safeCall(parseData, default)` |
| `safeParseJSON(json, fallback)` | Safe JSON parse | `safeParseJSON(str, {})` |
| `safeDateFormat(date, fn, fallback)` | Safe date format | `safeDateFormat(date, format, "")` |

## Error Boundary Usage

Wrap your app or specific sections with ErrorBoundary:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Wrap specific sections
<ErrorBoundary
  fallback={<div>Loading failed...</div>}
  onError={(error, info) => console.error(error)}
>
  <ExpensiveComponent />
</ErrorBoundary>
```

## Pre-Commit Checklist

Before committing code changes:

1. **Runtime Safety**
   - [ ] All array operations have null safety (`?.`, `||`, or safe helpers)
   - [ ] All object property access uses optional chaining
   - [ ] Hook returns are correctly destructured or assigned

2. **Type Safety**
   - [ ] No `any` types unless absolutely necessary
   - [ ] Proper type guards used for type narrowing
   - [ ] Interfaces exported for reusable types

3. **Error Handling**
   - [ ] Try-catch blocks for risky operations (JSON parsing, date parsing)
   - [ ] Error boundaries wrap critical sections
   - [ ] User-friendly error messages

4. **Testing**
   - [ ] Component renders with empty/undefined data
   - [ ] Component renders with error states
   - [ ] No console errors in browser dev tools

## Quick Reference Card

### When working with arrays from hooks/props:

```typescript
// Pattern: Safe array operations
const items = data?.items || [];
const filtered = items.filter(x => x.active);
const mapped = filtered.map(x => x.name);
const count = items.length;

// OR use helpers:
const filtered = safeFilter(data?.items, x => x.active);
const mapped = safeMap(filtered, x => x.name);
const count = safeLength(data?.items);
```

### When accessing nested properties:

```typescript
// Pattern: Safe property access
const value = obj?.prop?.nestedProp ?? defaultValue;

// OR use helper:
const value = safeGet(obj, "prop.nestedProp", defaultValue);
```

### When calling methods on potentially undefined values:

```typescript
// Pattern: Safe method calls
const result = value?.method?.() ?? fallback;

// OR use helper:
const result = safeCall(() => value.method(), fallback);
```

## Adding New Hooks

When creating new custom hooks that filter/transform data:

```typescript
// ✅ GOOD: Return direct array with null safety
export function useUserItems(userId: string) {
  const [allItems] = useItems();
  return (allItems || []).filter(item => item.userId === userId);
}

// ❌ BAD: No null safety, could crash
export function useUserItems(userId: string) {
  const [allItems] = useItems();
  return allItems.filter(item => item.userId === userId);
}
```
