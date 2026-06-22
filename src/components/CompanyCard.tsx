"use client";

import Link from "next/link";
import Image from "next/image";
import StarRating from "./StarRating";
import { Company } from "@/lib/types";
import { formatDate, getAvatarColor, getInitials } from "@/lib/utils";

interface CompanyCardProps {
  company: Company;
  averageRating?: number;
  reviewCount?: number;
}

export default function CompanyCard({
  company,
  averageRating = 0,
  reviewCount = 0,
}: CompanyCardProps) {
  const avatarColor = getAvatarColor(company.name);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-bold text-white ${avatarColor}`}
        >
          {company.logo ? (
            <Image
              src={company.logo}
              alt={company.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            getInitials(company.name)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">{company.name}</h2>
            <span className="text-xs text-gray-400">
              Founded on {formatDate(company.foundedOn)}
            </span>
          </div>

          <p className="mt-1 flex items-start gap-1 text-sm text-gray-500">
            <span className="mt-0.5">📍</span>
            <span>
              {company.location}, {company.city}
            </span>
          </p>

          {company.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {company.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {averageRating > 0 ? averageRating.toFixed(1) : "—"}
              </span>
              <StarRating rating={averageRating} size="sm" />
              <span className="text-xs text-gray-400">
                {reviewCount} Review{reviewCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/companies/${company._id}`}
          className="shrink-0 self-end rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 sm:self-center"
        >
          Detail Review
        </Link>
      </div>
    </article>
  );
}
