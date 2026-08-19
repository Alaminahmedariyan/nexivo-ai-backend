export type CreateTestimonialInput = {
  clientId?: string;
  clientName: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  content: string;
  rating?: number;
  isFeatured?: boolean;
  order?: number;
};

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>;