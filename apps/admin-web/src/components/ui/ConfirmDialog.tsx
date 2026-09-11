import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-text-secondary">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-grey-light"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
            isDanger ? "bg-red-600 hover:bg-red-700" : "bg-navy hover:bg-navy-secondary"
          }`}
        >
          {isLoading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
