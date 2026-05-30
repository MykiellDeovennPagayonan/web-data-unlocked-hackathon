"use client";

import {
  Bell,
  ChevronDown,
  CircleHelp,
  KeyRound,
  Menu,
  Search,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function TopBar({ platformName = "Acme Corp" }: { platformName?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="flex min-h-[70px] items-center gap-4 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-4 lg:px-6">
      <Button
        className="lg:hidden"
        variant="outline"
        size="icon-lg"
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <div className="relative min-w-0 flex-1 lg:max-w-[740px]">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--dashboard-muted)]"
          aria-hidden="true"
        />
        <label className="sr-only" htmlFor="global-search">
          Search identities, IPs, orgs, certificates
        </label>
        <input
          ref={inputRef}
          id="global-search"
          type="search"
          placeholder="Search identities, IPs, orgs, certificates..."
          className="h-12 w-full rounded-lg border border-[var(--dashboard-border)] bg-white pl-12 pr-24 text-[14px] font-medium text-[var(--dashboard-text)] shadow-[0_8px_30px_rgba(11,27,77,0.035)] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
        />
        <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 sm:flex">
          <span className="rounded bg-slate-50 px-2 py-1 text-[11px] font-semibold text-[var(--dashboard-muted)]">
            Ctrl
          </span>
          <span className="rounded bg-slate-50 px-2 py-1 text-[11px] font-semibold text-[var(--dashboard-muted)]">
            K
          </span>
        </div>
      </div>

      <div className="ml-auto hidden items-center gap-4 xl:flex">
        <button className="flex h-12 min-w-[220px] items-center gap-3 rounded-lg border border-[var(--dashboard-border)] bg-white px-4 text-left shadow-[0_8px_30px_rgba(11,27,77,0.035)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <span className="grid size-8 place-items-center rounded-md bg-blue-50 text-blue-600">
            <KeyRound className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-medium text-[var(--dashboard-muted)]">
              Platform
            </span>
            <span className="block truncate text-[13px] font-semibold text-[var(--dashboard-text)]">
              {platformName}
            </span>
          </span>
          <ChevronDown className="size-4 text-[var(--dashboard-muted)]" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-lg"
            className="relative bg-transparent text-[var(--dashboard-muted)] hover:bg-white hover:text-blue-600"
            aria-label="View notifications"
          >
            <Bell className="size-5" aria-hidden="true" />
            <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              2
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="bg-transparent text-[var(--dashboard-muted)] hover:bg-white hover:text-blue-600"
            aria-label="Open help"
          >
            <CircleHelp className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <button className="flex h-12 items-center gap-3 rounded-lg px-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <span className="grid size-10 place-items-center rounded-full bg-[#ffe1d7] text-[13px] font-bold text-[#7c2d12]">
            AM
          </span>
          <span className="hidden min-w-0 lg:block">
            <span className="block text-[13px] font-semibold text-[var(--dashboard-text)]">
              Alex Morgan
            </span>
            <span className="block text-[12px] font-medium text-[var(--dashboard-muted)]">
              Security Admin
            </span>
          </span>
          <ChevronDown className="size-4 text-[var(--dashboard-muted)]" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
