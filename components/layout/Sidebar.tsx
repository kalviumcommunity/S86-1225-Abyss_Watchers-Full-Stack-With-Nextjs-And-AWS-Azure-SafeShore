"use client";
import Link from "next/link";

export default function Sidebar() {
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/users", label: "Users" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-100 border-r p-4">
      <h2 className="text-lg font-bold mb-4">Navigation</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-gray-700 hover:text-blue-600">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
