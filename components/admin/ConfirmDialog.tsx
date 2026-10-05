"use client";

import { X } from "lucide-react";

export function ConfirmDialog({ title, description, confirmLabel = "Delete", onConfirm, onCancel }: { title: string; description: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return <div className="overlay confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><button type="button" className="close-button" onClick={onCancel} aria-label="Close"><X size={17}/></button><div className="eyebrow">PLEASE CONFIRM</div><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p><div className="drawer-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button type="button" className="primary danger-button" onClick={onConfirm}>{confirmLabel}</button></div></section></div>;
}
