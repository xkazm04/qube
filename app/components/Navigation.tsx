"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Social Hub
              </Link>
              <Link
                href="/kiwi"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/kiwi"
                    ? "text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Kiwi
              </Link>
              <Link
                href="/slevomat"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/slevomat"
                    ? "text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Slevomat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
