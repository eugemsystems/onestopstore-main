"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

const MainModal = ({ children, modalOpen, handleCloseModal }) => {
  const modalRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") handleCloseModal();
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [modalOpen, handleCloseModal]);

  const handleBackdropClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleCloseModal();
    }
  };

  if (!mounted || !modalOpen) return null;

  return createPortal(
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-[1px]"
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[min(100vw-1.5rem,56rem)] max-h-[min(92vh,900px)] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <button
          type="button"
          aria-label="Close modal"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
          onClick={handleCloseModal}
        >
          <IoClose className="text-lg" />
        </button>

        <div className="max-h-[min(92vh,900px)] overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MainModal;
