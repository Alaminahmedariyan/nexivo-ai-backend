import { OPERATOR_MAP, DEFAULT_SORT_FIELD, UNSAFE_KEYS } from "./constants";
import type { ParsedFilter, ParsedQuery, PrismaQueryArgs, QueryConfig } from "./types";

// Converts "client.companyName" + { contains: "x" } into
// { client: { companyName: { contains: "x" } } }
//
// Bug 11 fix — every path segment is checked against UNSAFE_KEYS before
// being used as an object key. Without this, a crafted query like
// `?__proto__[isAdmin]=true` (if such a field were ever whitelisted, or
// reached this function through any other path) could pollute
// Object.prototype and affect every object in the process.
const buildNestedField = (path: string, condition: unknown): Record<string, unknown> => {
  const segments = path.split(".");

  for (const segment of segments) {
    if (UNSAFE_KEYS.includes(segment)) {
      // Silently drop rather than throw — this should be unreachable in
      // practice since fields are already whitelist-checked in parser.ts,
      // so a hit here means defense-in-depth caught something unexpected.
      return {};
    }
  }

  return segments.reduceRight((acc, part) => ({ [part]: acc }), condition as Record<string, unknown>);
};

const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>) => {
  for (const [key, value] of Object.entries(source)) {
    // Bug 11 fix — reject unsafe keys before they're ever assigned onto
    // the target object.
    if (UNSAFE_KEYS.includes(key)) continue;

    const isPlainObj = (v: unknown) => v !== null && typeof v === "object" && !Array.isArray(v);
    if (isPlainObj(value) && isPlainObj(target[key])) {
      deepMerge(target[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
};

const buildWhereFromFilters = (filters: ParsedFilter[]): Record<string, unknown> => {
  // Group multiple operators on the same field: budget[gte]=1000&budget[lte]=5000
  const grouped: Record<string, Record<string, unknown>> = {};

  for (const { field, operator, value } of filters) {
    const prismaOp = OPERATOR_MAP[operator];
    if (!prismaOp) continue; // defensive — operator is already validated in parser.ts

    grouped[field] = { ...(grouped[field] ?? {}), [prismaOp]: value };
  }

  const where: Record<string, unknown> = {};
  for (const [field, condition] of Object.entries(grouped)) {
    deepMerge(where, buildNestedField(field, condition));
  }
  return where;
};

const buildSearchWhere = (
  search: string | undefined,
  searchableFields: string[] = [],
): Record<string, unknown> | undefined => {
  if (!search || searchableFields.length === 0) return undefined;
  return {
    OR: searchableFields.map((field) => buildNestedField(field, { contains: search, mode: "insensitive" })),
  };
};

const buildWhere = (parsed: ParsedQuery, config: QueryConfig): Record<string, unknown> => {
  const conditions: Record<string, unknown>[] = [];

  const filterWhere = buildWhereFromFilters(parsed.filters);
  if (Object.keys(filterWhere).length > 0) conditions.push(filterWhere);

  const searchWhere = buildSearchWhere(parsed.search, config.searchableFields);
  if (searchWhere) conditions.push(searchWhere);

  if (config.softDelete) conditions.push({ deletedAt: null });

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0] ?? {};
  return { AND: conditions };
};

const buildOrderBy = (parsed: ParsedQuery, config: QueryConfig): Record<string, unknown>[] => {
  if (parsed.sorts.length === 0) {
    return [{ [config.defaultSortField ?? DEFAULT_SORT_FIELD]: "desc" }];
  }
  return parsed.sorts.map(({ field, order }) => buildNestedField(field, order));
};

const buildSelect = (fields?: string[]): Record<string, unknown> | undefined => {
  if (!fields || fields.length === 0) return undefined;
  // Bug 11 fix — same guard applied here since `fields` values also
  // become object keys directly.
  const safeFields = fields.filter((f) => !UNSAFE_KEYS.includes(f));
  return safeFields.length > 0 ? Object.fromEntries(safeFields.map((f) => [f, true])) : undefined;
};

const buildInclude = (
  requested: string[] | undefined,
  defaultInclude: Record<string, boolean> | undefined,
): Record<string, unknown> | undefined => {
  const include: Record<string, boolean> = { ...(defaultInclude ?? {}) };
  for (const relation of requested ?? []) {
    if (UNSAFE_KEYS.includes(relation)) continue; // Bug 11 fix
    include[relation] = true;
  }
  return Object.keys(include).length > 0 ? include : undefined;
};

export const buildPrismaArgs = (parsed: ParsedQuery, config: QueryConfig): PrismaQueryArgs => {
  const select = buildSelect(parsed.fields);
  // Prisma disallows using `select` and `include` together at the same level —
  // if fields were explicitly requested, `include` is skipped for this query.
  const include = select ? undefined : buildInclude(parsed.include, config.defaultInclude);

  return {
    where: buildWhere(parsed, config),
    orderBy: buildOrderBy(parsed, config),
    skip: parsed.skip,
    take: parsed.limit,
    ...(select && { select }),
    ...(include && { include }),
  };
};