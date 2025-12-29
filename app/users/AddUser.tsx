"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";

export default function AddUser() {
  const { data } = useSWR("/api/users", fetcher);
  const [name, setName] = useState("");
  const { role } = useAuth();

  const canCreate = hasPermission(role, "create");

  const addUser = async () => {
    if (!name) return;

    // Optimistic update
    mutate(
      "/api/users",
      [...(data || []), { id: Date.now(), name, email: "temp@user.com" }],
      false
    );

    // Actual API call
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: "temp@user.com" }),
      });
    } catch (e) {
      console.error("Add user failed", e);
    }

    // Revalidate after update
    mutate("/api/users");
    setName("");
  };

  if (!canCreate) {
    return <p className="text-sm text-gray-600 mt-4">You do not have permission to add users.</p>;
  }

  return (
    <div className="mt-4">
      <input
        className="border px-2 py-1 mr-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter user name"
      />
      <button
        onClick={addUser}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Add User
      </button>
    </div>
  );
}
