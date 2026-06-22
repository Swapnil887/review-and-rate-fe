export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Company {
  _id: string;
  name: string;
  location: string;
  city: string;
  foundedOn: string;
  logo?: string;
  description?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  companyId: string;
  reviewerName: string;
  subject: string;
  reviewText: string;
  rating: number;
  likesCount: number;
  isLikedByUser: boolean;
  shares: number;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type CompanySort = "name" | "date" | "city";
export type ReviewSort = "date" | "rating" | "relevance";
