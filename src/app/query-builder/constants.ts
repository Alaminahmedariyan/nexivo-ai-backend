export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_MAX_LIMIT = 100;
export const DEFAULT_SORT_FIELD = "createdAt";

// Bug 8 fix — max relations allowed in one `?include=` list.
export const DEFAULT_MAX_INCLUDE = 5;

// Bug 12 fix — max dot-notation depth for a filter/sort field path
// ("client.companyName" = depth 2).
export const DEFAULT_MAX_NESTED_DEPTH = 2;

// Bug 7 fix — max character length for `?search=`.
export const DEFAULT_MAX_SEARCH_LENGTH = 150;

// Query-string keys reserved for QueryBuilder's own control params —
// never treated as filterable fields even if a model happens to have
// a column with the same name.
export const RESERVED_QUERY_KEYS = [
  "page",
  "limit",
  "search",
  "sortBy",
  "sortOrder",
  "sort",
  "fields",
  "include",
] as const;

// Maps the `field[op]=value` bracket syntax to Prisma's operator keys.
export const OPERATOR_MAP: Record<string, string> = {
  eq: "equals",
  not: "not",
  gt: "gt",
  gte: "gte",
  lt: "lt",
  lte: "lte",
  in: "in",
  notIn: "notIn",
  contains: "contains",
  startsWith: "startsWith",
  endsWith: "endsWith",
};

export const VALID_OPERATORS = Object.keys(OPERATOR_MAP);
export const SORT_ORDERS = ["asc", "desc"] as const;

// ============================================================
// Bug 5 + Bug 6 fix — which operators make sense per field type.
// Parser rejects any operator not listed here for a given field's type.
// ============================================================
export const OPERATORS_BY_TYPE: Record<string, string[]> = {
  string: ["eq", "not", "in", "notIn", "contains", "startsWith", "endsWith"],
  number: ["eq", "not", "gt", "gte", "lt", "lte", "in", "notIn"],
  decimal: ["eq", "not", "gt", "gte", "lt", "lte", "in", "notIn"],
  date: ["eq", "not", "gt", "gte", "lt", "lte", "in", "notIn"],
  boolean: ["eq", "not"],
  enum: ["eq", "not", "in", "notIn"],
};

// ============================================================
// Bug 11 fix — Prototype pollution guard. Any key matching one of
// these is dropped before merging into a where/filter object, whether
// it comes from a query-string key or a nested nested.notation path.
// ============================================================
export const UNSAFE_KEYS = ["__proto__", "constructor", "prototype"];

// Bug 4 fix — a strict YYYY-MM-DD (optionally with time) shape check
// that catches things like "2025-13-50" before they reach `new Date()`,
// since `new Date("2025-13-50")` silently rolls over into a valid-looking
// but wrong date instead of failing.
export const DATE_STRING_PATTERN =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;