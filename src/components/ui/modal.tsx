"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ isOpen, title, children, onClose }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} onCancel={onClose} onClose={onClose} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl backdrop:bg-brand-strong/55">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-serif text-2xl text-brand-strong">{title}</h2>
          <Button variant="ghost" className="-mr-2 -mt-2 size-10 px-0" onClick={onClose} aria-label="Fechar janela">×</Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
