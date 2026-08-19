import { buildPrismaArgs, parseQuery } from ".";
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_MAX_INCLUDE,
  DEFAULT_MAX_NESTED_DEPTH,
  DEFAULT_MAX_SEARCH_LENGTH,
  DEFAULT_SORT_FIELD,
} from "./constants";
import type {
  Meta,
  ParsedQuery,
  PrismaDelegate,
  PrismaQueryArgs,
  QueryConfig,
  QueryResult,
} from "./types";

const validateConfig = (config: QueryConfig): void => {
  for (const field of config.selectableFields ?? []) {
    if (field.includes(".")) {
      throw new Error(
        `QueryConfig.selectableFields: "${field}" is invalid — nested field selection (dot notation) is not supported. Use top-level field names only.`,
      );
    }
  }

  for (const relation of config.includableRelations ?? []) {
    if (relation.includes(".")) {
      throw new Error(
        `QueryConfig.includableRelations: "${relation}" is invalid — only direct relation names are supported, not nested paths.`,
      );
    }
  }

  for (const field of config.searchableFields ?? []) {
    const baseField = field.includes(".") ? undefined : field;
    if (baseField && config.filterableFields[baseField]) {
      const fieldConfig = config.filterableFields[baseField];
      const baseType = typeof fieldConfig === "string" ? fieldConfig : "enum";
      if (baseType !== "string") {
        throw new Error(
          `QueryConfig.searchableFields: "${field}" is type "${baseType}", but search uses "contains" which only works on string fields.`,
        );
      }
    }
  }
};

export class QueryBuilder<T, TWhereInput = Record<string, unknown>> {
  private readonly delegate: PrismaDelegate<T, TWhereInput>;
  private readonly config: QueryConfig;

  // Fix — param type now matches the field type exactly (was `PrismaDelegate<T>`,
  // which silently defaulted TWhereInput to Record<string, unknown> and broke
  // any typed usage like `new QueryBuilder<Lead, Prisma.LeadWhereInput>(...)`.
  constructor(delegate: PrismaDelegate<T, TWhereInput>, config: QueryConfig) {
    const merged: QueryConfig = {
      maxLimit: DEFAULT_MAX_LIMIT,
      maxInclude: DEFAULT_MAX_INCLUDE,
      maxNestedDepth: DEFAULT_MAX_NESTED_DEPTH,
      maxSearchLength: DEFAULT_MAX_SEARCH_LENGTH,
      defaultSortField: DEFAULT_SORT_FIELD,
      ...config,
    };

    validateConfig(merged);

    this.delegate = delegate;
    this.config = merged;
  }

  parse(rawQuery: Record<string, unknown>): ParsedQuery {
    return parseQuery(rawQuery, this.config);
  }

  buildArgs(parsed: ParsedQuery): PrismaQueryArgs {
    return buildPrismaArgs(parsed, this.config);
  }

  private buildMeta(parsed: ParsedQuery, total: number): Meta {
    return {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / parsed.limit)),
    };
  }

  async execute(rawQuery: Record<string, unknown>): Promise<QueryResult<T>> {
    const parsed = this.parse(rawQuery);
    const args = this.buildArgs(parsed);

    // args.where is built dynamically at runtime from the model's
    // QueryConfig (not statically known field-by-field), so it can't be a
    // structural match for the caller's exact Prisma WhereInput type. We
    // cast once, right at the Prisma boundary — safe because
    // buildPrismaArgs only ever emits field/operator shapes for fields the
    // model's own QueryConfig whitelisted in the first place.
    const where = args.where as unknown as TWhereInput;

    const [data, total] = await Promise.all([
      this.delegate.findMany({ ...args, where }),
      this.delegate.count({ where }),
    ]);

    return { data, meta: this.buildMeta(parsed, total) };
  }
}