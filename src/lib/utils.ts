import { ModalState } from "./utils.types";

export const toggleModal = (modalId: string, view: ModalState) => {
  const modalElement = document.getElementById(modalId) as HTMLDialogElement;
  if (modalElement) {
    view === ModalState.OPEN ? modalElement.showModal() : modalElement.close();
  }
};
