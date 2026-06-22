"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createCompany } from "@/lib/api";
import ImageUpload from "./ImageUpload";
import { useAuth } from "./AuthProvider";

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCompanyModal({
  open,
  onClose,
  onSuccess,
}: AddCompanyModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    location: "",
    city: "",
    foundedOn: "",
    logo: "",
    description: "",
  });

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createCompany(form);
      setForm({
        name: "",
        location: "",
        city: "",
        foundedOn: "",
        logo: "",
        description: "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Company</h2>
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
            to add a company.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
                placeholder="Graffersid Web and App Development"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                required
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
                placeholder="816, Shekhar Central, Manorama Ganj"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
                placeholder="Indore, Madhya Pradesh, India"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Founded On *
              </label>
              <input
                required
                type="date"
                value={form.foundedOn}
                onChange={(e) =>
                  setForm({ ...form, foundedOn: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
              />
            </div>

            <ImageUpload
              value={form.logo}
              onChange={(logo) => setForm({ ...form, logo })}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#8E2DE2]"
                placeholder="Brief description about the company..."
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
                {loading ? "Creating..." : "Create Company"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
