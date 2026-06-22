"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createReview } from "@/lib/api";
import StarRating from "./StarRating";
import { useAuth } from "./AuthProvider";

interface AddReviewModalProps {
  open: boolean;
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddReviewModal({
  open,
  companyId,
  onClose,
  onSuccess,
}: AddReviewModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    reviewerName: user?.name || "",
    subject: "",
    reviewText: "",
    rating: 5,
  });

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createReview(companyId, form);
      setForm({
        reviewerName: user?.name || "",
        subject: "",
        reviewText: "",
        rating: 5,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Review</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {!user ? (
          <div className="rounded-xl bg-purple-50 p-4 text-sm text-purple-800">
            You need to{" "}
            <Link href="/login" className="font-semibold underline">
              login
            </Link>{" "}
            to add a review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                required
                value={form.reviewerName}
                onChange={(e) =>
                  setForm({ ...form, reviewerName: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Subject *
              </label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
                placeholder="Great workplace culture"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Review *
              </label>
              <textarea
                required
                rows={4}
                value={form.reviewText}
                onChange={(e) =>
                  setForm({ ...form, reviewText: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
                placeholder="Share your experience..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rating *
              </label>
              <StarRating
                rating={form.rating}
                size="lg"
                interactive
                onChange={(rating) => setForm({ ...form, rating })}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Posting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
