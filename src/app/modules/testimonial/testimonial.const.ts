import type { QueryConfig } from "../../query-builder";

export const TESTIMONIAL_QUERY_CONFIG: QueryConfig = {
  searchableFields: ["clientName", "company", "content"],
  filterableFields: {
    isFeatured: "boolean",
    rating: "number",
  },
  sortableFields: ["order", "rating", "createdAt"],
  softDelete: false,
  defaultSortField: "order",
  maxLimit: 50,
};