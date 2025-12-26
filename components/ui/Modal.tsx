"use client";
import React, { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  confirmLabel?: string;
  children?: React.ReactNode;
}

export default function Modal({ isOpen, title, onClose, onConfirm, confirmLabel = "Confirm", children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        // simple focus trap
        const modal = dialogRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        dialogRef.current?.focus();
      }, 0);
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg bg-white rounded shadow p-6 mx-4"
      >
        {title && <h2 id="modal-title" className="text-lg font-semibold mb-3">{title}</h2>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          {onConfirm && (
            <button onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white">{confirmLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
