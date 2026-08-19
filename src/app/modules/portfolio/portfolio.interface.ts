export type CreatePortfolioInput = {
  title: string;
  description: string;
  thumbnail: string;
  liveUrl?: string;
  serviceId?: string;
  isFeatured?: boolean;
  order?: number;
  images?: { url: string; alt?: string; order?: number }[];
  technologyIds?: string[];
};

export type UpdatePortfolioInput = Partial<{
  title: string;
  description: string;
  thumbnail: string;
  liveUrl: string;
  serviceId: string;
  isFeatured: boolean;
  order: number;
}>;

export type AddPortfolioImageInput = { url: string; alt?: string; order?: number };