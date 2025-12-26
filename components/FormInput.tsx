"use client";
import React from "react";

interface FormInputProps {
  label: string;
  type?: string;
  register: any;
  name: string;
  error?: string | undefined;
}

export default function FormInput({ label, type = "text", register, name, error }: FormInputProps) {
  return (
    <div className="mb-3">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        {...register(name)}
        aria-invalid={!!error}
        className="w-full border p-2 rounded"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
