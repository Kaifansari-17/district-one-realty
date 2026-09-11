import { Modal } from "@/components/common/Modal";
import { InquiryForm } from "@/components/common/InquiryForm";

export function RequestCallbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request a Callback">
      <InquiryForm source="WEBSITE" compact />
    </Modal>
  );
}
