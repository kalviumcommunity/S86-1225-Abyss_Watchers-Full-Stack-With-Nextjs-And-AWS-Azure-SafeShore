"use client";
import React from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <h2 className="text-xl font-semibold text-red-600">Failed to load user.</h2>
      <p className="text-gray-600 mt-2">{error?.message || "Unable to fetch user data."}</p>
      <button
        onClick={() => reset()}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
