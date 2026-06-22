"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/api";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Company Logo",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
          {value ? (
            <Image
              src={value}
              alt="Uploaded logo"
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-xs text-gray-400">No logo</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-400">
        JPG, PNG, WebP or GIF. Max 5MB. Uploaded to Cloudinary.
      </p>
    </div>
  );
}
