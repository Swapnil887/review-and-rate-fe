"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import EditReviewModal from "./EditReviewModal";
import { Review } from "@/lib/types";
import { formatDate, getReviewOwnerId } from "@/lib/utils";
import { deleteReview, likeReview, shareReview } from "@/lib/api";
import { useAuth } from "./AuthProvider";

interface ReviewCardProps {
  review: Review;
  companyId: string;
  onUpdate: () => void;
}

export default function ReviewCard({
  review,
  companyId,
  onUpdate,
}: ReviewCardProps) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(review.likesCount);
  const [isLiked, setIsLiked] = useState(review.isLikedByUser);
  const [shares, setShares] = useState(review.shares);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!user && getReviewOwnerId(review.userId) === user.id;

  const handleLike = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await likeReview(companyId, review._id);
      setLikesCount(data.likesCount);
      setIsLiked(data.isLiked);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const data = await shareReview(companyId, review._id);
      setShares(data.shares);

      const url = `${window.location.origin}/companies/${companyId}`;
      if (navigator.share) {
        await navigator.share({
          title: review.subject,
          text: review.reviewText,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Review link copied to clipboard!");
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteReview(companyId, review._id);
      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
            <p className="text-sm font-medium text-[#8E2DE2]">{review.subject}</p>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="text-xs font-medium text-[#8E2DE2] hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
            <span className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm font-medium text-gray-700">
            {review.rating.toFixed(1)}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {review.reviewText}
        </p>

        <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3">
          <button
            type="button"
            onClick={handleLike}
            disabled={!user || loading}
            className={`flex items-center gap-1.5 text-sm ${
              isLiked ? "text-[#8E2DE2]" : "text-gray-500"
            } ${!user ? "cursor-not-allowed opacity-50" : "hover:text-[#8E2DE2]"}`}
            title={user ? "Like review" : "Login to like"}
          >
            {isLiked ? "❤️" : "🤍"} {likesCount}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8E2DE2]"
          >
            🔗 Share ({shares})
          </button>
        </div>
      </article>

      <EditReviewModal
        open={showEditModal}
        review={review}
        companyId={companyId}
        onClose={() => setShowEditModal(false)}
        onSuccess={onUpdate}
      />
    </>
  );
}
