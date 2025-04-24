export enum UiToggleState {
  OPEN,
  CLOSE,
}

export const toggleModal = (modalId: string, view: UiToggleState) => {
  const modalElement = document.getElementById(modalId) as HTMLDialogElement;
  if (modalElement) {
    view === UiToggleState.OPEN
      ? modalElement.showModal()
      : modalElement.close();
  }
};
