"use client";
import Link from "next/link";
import { useUI } from "@/hooks/useUI";

export default function Header() {
  const { theme, toggleTheme } = useUI();

  return (
    <header className="w-full bg-brand text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-semibold text-lg">Abyss Watchers</h1>
      <nav className="flex gap-4 items-center">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/users">Users</Link>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="ml-3 p-2 rounded bg-white/10 hover:bg-white/20"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </nav>
    </header>
  );
}
