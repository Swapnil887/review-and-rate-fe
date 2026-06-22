"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCompany, getCompanyReviews } from "@/lib/api";
import { Company, Review, ReviewSort } from "@/lib/types";
import { formatDate, getAvatarColor, getInitials } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";
import AddReviewModal from "@/components/AddReviewModal";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [sortBy, setSortBy] = useState<ReviewSort>("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [companyData, reviewsData] = await Promise.all([
        getCompany(companyId),
        getCompanyReviews(companyId, sortBy, order),
      ]);

      setCompany(companyData.company);
      setReviews(reviewsData.reviews);
      setAverageRating(reviewsData.averageRating);
      setReviewCount(reviewsData.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load company");
    } finally {
      setLoading(false);
    }
  }, [companyId, sortBy, order]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f9fc]">
        <p className="text-red-500">{error || "Company not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm text-[#8E2DE2] hover:underline"
        >
          Back to listings
        </button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(company.name);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] text-white">
              ★
            </div>
            <span className="text-xl font-bold text-gray-900">Review&RATE</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-[#8E2DE2]"
          >
            ← Back to listings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold text-white ${avatarColor}`}
            >
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                getInitials(company.name)
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {company.name}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                📍 {company.location}, {company.city}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Founded on {formatDate(company.foundedOn)}
              </p>
              {company.description && (
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <StarRating rating={averageRating} size="lg" />
                <span className="text-sm text-gray-500">
                  ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ReviewSort)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="relevance">Sort by Relevance</option>
              </select>

              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>

              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="rounded-lg bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] px-5 py-2.5 text-sm font-medium text-white"
              >
                + Add Review
              </button>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">No reviews yet. Be the first!</p>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="mt-3 text-sm font-medium text-[#8E2DE2] hover:underline"
              >
                Add a review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  companyId={companyId}
                  onUpdate={fetchData}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <AddReviewModal
        open={showReviewModal}
        companyId={companyId}
        onClose={() => setShowReviewModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
