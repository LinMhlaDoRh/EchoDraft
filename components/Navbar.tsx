"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMic } from "react-icons/fi";

const nav = [
  { label: "Generate", href: "/" },
  { label: "Voice Profile", href: "/voice-profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-canvas border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary-text"
          aria-label="EchoDraft home"
        >
          <FiMic className="w-6 h-6 text-accent-blue" aria-hidden="true" />
          <span className="font-semibold text-lg tracking-tight">EchoDraft</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-blue-soft text-accent-blue"
                    : "text-secondary-text hover:bg-surface-2 hover:text-primary-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
