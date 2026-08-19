// ============================================================
// Field data types — "enum" is intentionally NOT listed here as a
// bare string; it always requires its enum map (see FilterConfig
// below), so a config can never say `status: "enum"` without also
// supplying which values are valid.
// ============================================================
export type FieldType = "string" | "number" | "decimal" | "boolean" | "date" | "enum";

// Supported filter operators (mirrors Prisma's comparison ops)
export type FilterOperator =
  | "eq"
  | "not"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "notIn"
  | "contains"
  | "startsWith"
  | "endsWith";

// ============================================================
// Bug 1 fix — enum fields must declare their allowed values so the
// parser can reject `?status=XYZ` with a 400 instead of letting it
// reach Prisma and blow up as a 500.
// ============================================================
export type EnumFilterConfig = {
  type: "enum";
  enum: Record<string, string>; // pass the Prisma enum object directly, e.g. LeadStatus
};

// Bug 2 fix — "decimal" added as its own primitive type, separate
// from "number", so parser.ts can route it through Prisma.Decimal
// instead of JS `Number` (which loses precision on money fields).
export type FilterConfig = "string" | "number" | "decimal" | "boolean" | "date" | EnumFilterConfig;

// ============================================================
// Per-model configuration — the whitelist that keeps QueryBuilder
// safe and correct across ANY Prisma model.
// ============================================================
export type QueryConfig = {
  // Fields the free-text `?search=` param matches against (contains,
  // case-insensitive). Dot-notation supported for one-level relations.
  searchableFields?: string[];

  // Every field allowed in `?field=value` / `?field[op]=value`, mapped to
  // its FilterConfig so the raw string value is validated/cast correctly.
  // Dot-notation supported: "client.companyName".
  filterableFields: Record<string, FilterConfig>;

  // Fields allowed in `?sortBy=` / `?sort=`. Dot-notation supported.
  sortableFields: string[];

  // Relation names allowed in `?include=`.
  includableRelations?: string[];

  // Relations included by default even without `?include=`.
  defaultInclude?: Record<string, boolean>;

  // Auto-scopes every query to `deletedAt: null`.
  // Only set true for models that actually have a deletedAt column.
  softDelete?: boolean;

  // Hard cap on `?limit=`. Default 100 — prevents full-table-scan abuse.
  maxLimit?: number;

  // Fields allowed in `?fields=` (maps to Prisma `select`).
  selectableFields?: string[];

  // Field used for the default sort when no sort param is given.
  // Default "createdAt".
  defaultSortField?: string;

  // Bug 8 fix — max number of relations allowed in one `?include=` list.
  // Default 5.
  maxInclude?: number;

  // Bug 12 fix — max dot-notation depth allowed for a filter/sort field
  // path (e.g. "client.companyName" = depth 2). Default 2.
  maxNestedDepth?: number;

  // Bug 7 fix — max character length allowed for `?search=`. Default 150.
  maxSearchLength?: number;
};

// ============================================================
// Intermediate parsed representation (parser.ts output)
// ============================================================
export type ParsedFilter = {
  field: string;
  operator: FilterOperator;
  value: unknown;
};

export type ParsedSort = {
  field: string;
  order: "asc" | "desc";
};

export type ParsedQuery = {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  filters: ParsedFilter[];
  sorts: ParsedSort[];
  fields?: string[];
  include?: string[];
};

// ============================================================
// Final Prisma-ready args (merge.ts output)
// ============================================================
export type PrismaQueryArgs = {
  where: Record<string, unknown>;
  orderBy: Record<string, unknown>[];
  skip: number;
  take: number;
  select?: Record<string, unknown>;
  include?: Record<string, unknown>;
};

export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type QueryResult<T> = {
  data: T[];
  meta: Meta;
};

// Minimal structural shape every Prisma model delegate satisfies
// (prisma.user, prisma.lead, prisma.project, ...) — this is what lets
// ONE QueryBuilder work generically across all of them.
export type PrismaDelegate<T, TWhereInput = Record<string, unknown>> = {
  findMany: (args: {
    where?: TWhereInput;
    orderBy?: Record<string, unknown>[];
    skip?: number;
    take?: number;
    select?: Record<string, unknown>;
    include?: Record<string, unknown>;
  }) => Promise<T[]>;
  count: (args: { where?: TWhereInput }) => Promise<number>;
};