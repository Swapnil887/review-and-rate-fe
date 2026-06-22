"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import CompanyCard from "@/components/CompanyCard";
import AddCompanyModal from "@/components/AddCompanyModal";
import { getCompanies, getCompanyReviews } from "@/lib/api";
import { Company, CompanySort } from "@/lib/types";

interface CompanyWithStats extends Company {
  averageRating: number;
  reviewCount: number;
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState<CompanySort>("name");
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCompanies({
        search: search || undefined,
        city: city || undefined,
        location: location || undefined,
      });

      const withStats = await Promise.all(
        data.companies.map(async (company) => {
          try {
            const reviewsData = await getCompanyReviews(company._id);
            return {
              ...company,
              averageRating: reviewsData.averageRating,
              reviewCount: reviewsData.count,
            };
          } catch {
            return {
              ...company,
              averageRating: 0,
              reviewCount: 0,
            };
          }
        })
      );

      setCompanies(withStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [search, city, location]);

  useEffect(() => {
    const timer = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(timer);
  }, [fetchCompanies]);

  const sortedCompanies = useMemo(() => {
    const list = [...companies];
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "city") return a.city.localeCompare(b.city);
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    return list;
  }, [companies, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header search={search} onSearchChange={setSearch} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Select City
            </label>
            <div className="relative">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Indore, Madhya Pradesh, India"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#8E2DE2]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E2DE2]">
                📍
              </span>
            </div>
          </div>

          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by location..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8E2DE2]"
            />
          </div>

          <button
            type="button"
            onClick={fetchCompanies}
            className="rounded-lg bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] px-6 py-2.5 text-sm font-medium text-white"
          >
            Find Company
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] px-6 py-2.5 text-sm font-medium text-white"
          >
            + Add Company
          </button>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CompanySort)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="city">City</option>
            </select>
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Result Found: {sortedCompanies.length}
        </p>

        {loading && (
          <div className="py-12 text-center text-gray-500">Loading companies...</div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && sortedCompanies.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">No companies found.</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-sm font-medium text-[#8E2DE2] hover:underline"
            >
              Add the first company
            </button>
          </div>
        )}

        <div className="space-y-4">
          {sortedCompanies.map((company) => (
            <CompanyCard
              key={company._id}
              company={company}
              averageRating={company.averageRating}
              reviewCount={company.reviewCount}
            />
          ))}
        </div>
      </main>

      <AddCompanyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
