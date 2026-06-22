"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ search, onSearchChange }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] text-white">
            ★
          </div>
          <span className="text-xl font-bold text-gray-900">Review&RATE</span>
        </Link>

        <div className="relative hidden flex-1 md:block">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-full border border-gray-200 py-2.5 pl-5 pr-12 text-sm outline-none focus:border-[#8E2DE2]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E2DE2]">
            🔍
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">
                Hi, {user.name}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm font-medium text-gray-700 hover:text-[#8E2DE2]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="text-sm font-medium text-gray-700 hover:text-[#8E2DE2]"
              >
                SignUp
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-[#8E2DE2]"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
