export const closeModal = (modalId: string) => {
  const modalElement = document.getElementById(modalId) as HTMLDialogElement;
  if (modalElement) modalElement.close();
};

export const showModal = (modalId: string) => {
  const modalElement = document.getElementById(modalId) as HTMLDialogElement;
  if (modalElement) modalElement.showModal();
};
