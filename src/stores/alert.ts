import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

enum AlertTypeEnum {
  SUCCESS,
  ERROR,
}

type AlertType = {
  id: string;
  type: AlertTypeEnum;
  message: string;
  expiresAt: Date;
};

interface AlertState {
  alerts: AlertType[];
  add: (alert: { type: AlertTypeEnum; message: string }) => void;
  dismiss: (alertId: string) => void;
}

const ALERT_TIME_TO_DISMISS_IN_MS = 4000;

const useAlertStore = create<AlertState>()(
  devtools(
    persist(
      (set) => ({
        alerts: [],
        add: (alert: { type: AlertTypeEnum; message: string }) =>
          set((state) => ({
            alerts: [
              ...state.alerts,
              {
                ...alert,
                id: nanoid(),
                expiresAt: dayjs()
                  .add(ALERT_TIME_TO_DISMISS_IN_MS, "milliseconds")
                  .toDate(),
              },
            ],
          })),
        dismiss: (alertId: string) =>
          set((state) => ({
            alerts: state.alerts.filter((element) => element.id != alertId),
          })),
      }),
      { name: "alert" },
    ),
  ),
);

export default useAlertStore;
export { AlertTypeEnum, type AlertType };
