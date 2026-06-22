import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveAuth,
} from "./auth-storage";
import { AuthResponse, Company, Review, ReviewSort } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearAuth();
    return null;
  }

  const data = await response.json();
  const user = getStoredUser();
  if (user) {
    saveAuth(user, data.accessToken, data.refreshToken);
  }
  return data.accessToken as string;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, options, false);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

export async function signup(name: string, email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearAuth();
  }
}

export async function getCompanies(params?: {
  search?: string;
  city?: string;
  location?: string;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.city) query.set("city", params.city);
  if (params?.location) query.set("location", params.location);

  const qs = query.toString();
  return apiFetch<{ companies: Company[]; count: number }>(
    `/api/companies${qs ? `?${qs}` : ""}`
  );
}

export async function getCompany(id: string) {
  return apiFetch<{ company: Company }>(`/api/companies/${id}`);
}

export async function createCompany(payload: {
  name: string;
  location: string;
  city: string;
  foundedOn: string;
  logo?: string;
  description?: string;
}) {
  return apiFetch<{ company: Company }>("/api/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCompanyReviews(
  companyId: string,
  sortBy: ReviewSort = "date",
  order: "asc" | "desc" = "desc"
) {
  return apiFetch<{
    reviews: Review[];
    averageRating: number;
    count: number;
  }>(
    `/api/companies/${companyId}/reviews?sortBy=${sortBy}&order=${order}`
  );
}

export async function createReview(
  companyId: string,
  payload: {
    reviewerName: string;
    subject: string;
    reviewText: string;
    rating: number;
  }
) {
  return apiFetch<{ review: Review }>(`/api/companies/${companyId}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReview(
  companyId: string,
  reviewId: string,
  payload: {
    reviewerName: string;
    subject: string;
    reviewText: string;
    rating: number;
  }
) {
  return apiFetch<{ review: Review }>(
    `/api/companies/${companyId}/reviews/${reviewId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteReview(companyId: string, reviewId: string) {
  return apiFetch<{ message: string }>(
    `/api/companies/${companyId}/reviews/${reviewId}`,
    { method: "DELETE" }
  );
}

export async function likeReview(companyId: string, reviewId: string) {
  return apiFetch<{ likesCount: number; isLiked: boolean }>(
    `/api/companies/${companyId}/reviews/${reviewId}/like`,
    { method: "POST" }
  );
}

export async function shareReview(companyId: string, reviewId: string) {
  return apiFetch<{ shares: number }>(
    `/api/companies/${companyId}/reviews/${reviewId}/share`,
    { method: "POST" }
  );
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to upload image");
  }

  return data.url as string;
}
