"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

export default function FeedbackDemo() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isProcessing, setProcessing] = useState(false);

  function handleToast() {
    toast.loading("Working...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Operation completed successfully");
    }, 1000);
  }

  async function handleConfirm() {
    setProcessing(true);
    // simulate async work
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setModalOpen(false);
      toast.success("Confirmed and completed");
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feedback UI Demo</h1>

      <div className="space-x-3">
        <button onClick={handleToast} className="bg-blue-600 text-white px-3 py-1 rounded">Show Toast</button>
        <button onClick={() => setModalOpen(true)} className="bg-red-600 text-white px-3 py-1 rounded">Open Modal</button>
      </div>

      <Modal isOpen={isModalOpen} title="Confirm Action" onClose={() => setModalOpen(false)} onConfirm={handleConfirm} confirmLabel={isProcessing ? "Processing..." : "Confirm"}>
        <p>This is a blocking confirmation. Confirm to start a process.</p>
        {isProcessing && (
          <div className="mt-3 flex items-center gap-2">
            <Spinner />
            <span>Processing…</span>
          </div>
        )}
      </Modal>
    </main>
  );
}
