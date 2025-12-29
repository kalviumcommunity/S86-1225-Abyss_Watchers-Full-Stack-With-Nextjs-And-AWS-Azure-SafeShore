"use client";

import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return setStatus("No file selected");

    // Basic client-side validation
    if (!["image/png", "image/jpeg", "application/pdf"].includes(file.type)) {
      return setStatus("Only PNG, JPEG, and PDF allowed");
    }
    if (file.size > 5 * 1024 * 1024) return setStatus("File too large (max 5MB)");

    setStatus("Requesting upload URL...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, fileType: file.type }),
      });

      const json = await res.json();
      if (!json.success) return setStatus(json.message || "Failed to get upload URL");

      setStatus("Uploading to S3...");
      const uploadRes = await fetch(json.uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) return setStatus("Upload failed");

      setStatus("Upload successful. Key: " + json.key);
    } catch (e: any) {
      setStatus("Error: " + (e.message || String(e)));
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <label className="block mb-2">Upload file</label>
      <input type="file" onChange={handleChange} />
      <div className="mt-3">
        <button onClick={handleUpload} className="px-3 py-1 bg-blue-600 text-white rounded">
          Upload
        </button>
      </div>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
