import type { QueryConfig } from "../../query-builder";

export const SERVICE_QUERY_CONFIG: QueryConfig = {
  searchableFields: ["title", "description"],
  filterableFields: {
    isActive: "boolean",
    slug: "string",
  },
  sortableFields: ["title", "order", "createdAt"],
  includableRelations: ["packages", "portfolios"],
  defaultInclude: { packages: true },
  softDelete: false,
  defaultSortField: "order",
  maxLimit: 50,
};

export const SERVICE_DETAIL_INCLUDE = {
  packages: { orderBy: { order: "asc" as const } },
} as const;