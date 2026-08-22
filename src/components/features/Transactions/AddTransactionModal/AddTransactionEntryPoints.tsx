"use client";

import React, { useEffect } from "react";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";
import { AddTransactionModal } from "./AddTransactionModal";
import { Button } from "@heroui/react";

/**
 * Global entry points for the AI Draft Transaction Pipeline, mounted once
 * at the private layout root (`src/app/(ui)/private/layout.tsx`) so every
 * page shares the same store-driven modal instance:
 *  - A fixed-position floating action button (judgment call — the SDD's
 *    Milestone 3 checklist says "Wire global entry points (FAB / Bottom Nav
 *    `+`, Navbar CTA, and `Cmd+K` / `N` shortcuts)" but does not specify a
 *    concrete placement; bottom-right FAB was chosen as the least invasive
 *    option that doesn't require Navbar/Sidebar layout changes).
 *  - A `Cmd+K` / `Ctrl+K` / `N` global keyboard shortcut (ignored while
 *    focus is inside a text input/textarea/contenteditable element, or
 *    while the modal is already open).
 *  - The single globally-mounted `<AddTransactionModal>`.
 */
export const AddTransactionEntryPoints: React.FC = () => {
  const isOpen = useTransactionDraftStore((s) => s.isOpen);
  const openDraftModal = useTransactionDraftStore((s) => s.openDraftModal);
  const closeDraftModal = useTransactionDraftStore((s) => s.closeDraftModal);
  const resetDraft = useTransactionDraftStore((s) => s.resetDraft);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isOpen) return;

      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isBareN = !isTypingTarget && e.key.toLowerCase() === "n";

      if (isCmdK || isBareN) {
        e.preventDefault();
        openDraftModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, openDraftModal]);

  const handleClose = () => {
    resetDraft();
    closeDraftModal();
  };

  return (
    <>
      <Button
        aria-label="Add transaction"
        variant="primary"
        isIconOnly
        onClick={() => openDraftModal()}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full shadow-2xl bg-success transition-transform hover:scale-105 md:bottom-8 md:right-8"
      >
        <HiOutlineSparkles className="text-4xl" />
      </Button>
      <AddTransactionModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
};
