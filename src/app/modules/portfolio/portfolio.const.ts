import type { QueryConfig } from "../../query-builder";

// Note: `technologies` (the Portfolio <-> Technology join) is intentionally
// NOT in includableRelations — it needs a nested include
// (technologies: { include: { technology: true } }), which QueryBuilder's
// flat defaultInclude (Record<string, boolean>) doesn't express. The list
// endpoint returns images + service only; getPortfolioBySlug returns the
// full nested shape via a dedicated query.
export const PORTFOLIO_QUERY_CONFIG: QueryConfig = {
  searchableFields: ["title", "description"],
  filterableFields: {
    isFeatured: "boolean",
    serviceId: "string",
    slug: "string",
    "service.title": "string",
  },
  sortableFields: ["title", "order", "createdAt"],
  includableRelations: ["images", "service"],
  defaultInclude: { images: true },
  softDelete: false,
  defaultSortField: "order",
  maxLimit: 50,
};

export const PORTFOLIO_DETAIL_INCLUDE = {
  images: { orderBy: { order: "asc" as const } },
  technologies: { include: { technology: true } },
  service: { select: { id: true, title: true, slug: true } },
} as const;