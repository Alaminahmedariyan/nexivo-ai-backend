export type CreateServiceInput = {
  title: string;
  description: string;
  icon?: string;
  order?: number;
};

export type UpdateServiceInput = Partial<{
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}>;

export type CreateServicePackageInput = {
  name: string;
  price: number;
  features: unknown; // array of { label, icon?, highlight? }
  order?: number;
};

export type UpdateServicePackageInput = Partial<CreateServicePackageInput>;