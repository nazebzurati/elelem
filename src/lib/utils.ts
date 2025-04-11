import { UiToggleState } from "./utils.types";

export const toggleModal = (modalId: string, view: UiToggleState) => {
  const modalElement = document.getElementById(modalId) as HTMLDialogElement;
  if (modalElement) {
    view === UiToggleState.OPEN
      ? modalElement.showModal()
      : modalElement.close();
  }
};

export const toggleDrawer = (modalId: string, view: UiToggleState) => {
  const drawerElement = document.getElementById(modalId) as HTMLInputElement;
  if (drawerElement) {
    drawerElement.checked = view === UiToggleState.OPEN;
  }
};
