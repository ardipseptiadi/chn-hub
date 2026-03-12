/**
 * Safe Helper Functions
 *
 * Runtime safeguards for common operations that can fail with undefined/null values.
 * Use these helpers to prevent runtime errors in components.
 */

/**
 * Safely filter an array, returning empty array if input is not an array
 * @param arr - The array to filter (may be undefined/null)
 * @param predicate - The filter function
 * @returns Filtered array or empty array
 */
export function safeFilter<T>(
  arr: T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(predicate);
}

/**
 * Safely map an array, returning empty array if input is not an array
 * @param arr - The array to map (may be undefined/null)
 * @param mapper - The map function
 * @returns Mapped array or empty array
 */
export function safeMap<T, U>(
  arr: T[] | undefined | null,
  mapper: (value: T, index: number, array: T[]) => U
): U[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(mapper);
}

/**
 * Safely get array length, returning 0 if input is not an array
 * @param arr - The array (may be undefined/null)
 * @returns Array length or 0
 */
export function safeLength(arr: unknown[] | undefined | null): number {
  if (!Array.isArray(arr)) return 0;
  return arr.length;
}

/**
 * Safely sort an array, returning empty array if input is not an array
 * @param arr - The array to sort (may be undefined/null)
 * @param compareFn - The compare function
 * @returns Sorted array or empty array
 */
export function safeSort<T>(
  arr: T[] | undefined | null,
  compareFn?: (a: T, b: T) => number
): T[] {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort(compareFn);
}

/**
 * Safely reduce an array, returning initial value if input is not an array
 * @param arr - The array to reduce (may be undefined/null)
 * @param reducer - The reducer function
 * @param initial - The initial value
 * @returns Reduced value or initial value
 */
export function safeReduce<T, U>(
  arr: T[] | undefined | null,
  reducer: (acc: U, value: T, index: number, array: T[]) => U,
  initial: U
): U {
  if (!Array.isArray(arr)) return initial;
  return arr.reduce(reducer, initial);
}

/**
 * Safely find an element, returning undefined if input is not an array
 * @param arr - The array to search (may be undefined/null)
 * @param predicate - The find function
 * @returns Found element or undefined
 */
export function safeFind<T>(
  arr: T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean
): T | undefined {
  if (!Array.isArray(arr)) return undefined;
  return arr.find(predicate);
}

/**
 * Safely get array element at index, returning undefined if out of bounds or not an array
 * @param arr - The array (may be undefined/null)
 * @param index - The index
 * @returns Element at index or undefined
 */
export function safeAt<T>(arr: T[] | undefined | null, index: number): T | undefined {
  if (!Array.isArray(arr)) return undefined;
  return arr[index];
}

/**
 * Safely check if array is empty, returning true if not an array or empty
 * @param arr - The array (may be undefined/null)
 * @returns true if array is empty or not an array
 */
export function isEmpty(arr: unknown[] | undefined | null): boolean {
  if (!Array.isArray(arr)) return true;
  return arr.length === 0;
}

/**
 * Type guard to check if value is an array
 * @param value - The value to check
 * @returns true if value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Ensure a value is an array, wrapping single values if needed
 * @param value - The value to ensure is an array
 * @returns An array
 */
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Safely access a nested property with a fallback
 * @param obj - The object
 * @param path - The path to access (e.g., "user.name" or ["user", "name"])
 * @param fallback - The fallback value
 * @returns The property value or fallback
 */
export function safeGet<T>(
  obj: Record<string, unknown> | undefined | null,
  path: string | string[],
  fallback: T
): T {
  if (obj === null || obj === undefined) return fallback;

  const keys = typeof path === "string" ? path.split(".") : path;
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return fallback;
    if (typeof current !== "object") return fallback;
    current = (current as Record<string, unknown>)[key];
  }

  return (current as T) ?? fallback;
}

/**
 * Safely call a function, returning fallback if function throws
 * @param fn - The function to call
 * @param fallback - The fallback value
 * @returns The function result or fallback
 */
export function safeCall<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * Safely parse JSON, returning fallback if parsing fails
 * @param json - The JSON string
 * @param fallback - The fallback value
 * @returns The parsed object or fallback
 */
export function safeParseJSON<T>(json: string | undefined | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely format a date, returning fallback string if date is invalid
 * @param date - The date to format
 * @param formatFn - The format function
 * @param fallback - The fallback string
 * @returns Formatted date string or fallback
 */
export function safeDateFormat(
  date: string | Date | undefined | null,
  formatFn: (date: Date) => string,
  fallback: string = ""
): string {
  if (!date) return fallback;
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return fallback;
    return formatFn(d);
  } catch {
    return fallback;
  }
}
