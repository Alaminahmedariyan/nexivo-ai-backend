export const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  phone: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export const USER_SEARCHABLE_FIELDS = [
  "name",
  "email",
  "phone",
] as const;

export const USER_FILTERABLE_FIELDS = [
  "role",
  "isActive",
] as const;

export const USER_DEFAULT_SORT = "createdAt";