"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setLoading(true);
    // Mock token (in real apps, fetch from backend and set secure cookie)
    // Here we set a simple cookie that middleware will read.
    document.cookie = `token=mock.jwt.token; path=/`;
    // small delay to simulate network
    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  }

  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-xl font-semibold">Login Page</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </main>
  );
}
