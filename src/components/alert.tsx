import useAlert, { AlertType, AlertTypeEnum } from "@stores/alert";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect } from "react";

const ALERT_POLLING_INTERVAL_IN_MS = 1000;

export default function Alerts() {
  const alertStore = useAlert();

  // poll to dismiss alerts
  useEffect(() => {
    const interval = setInterval(() => {
      alertStore.alerts.forEach((alert) => {
        if (alert.expiresAt <= dayjs().toDate()) {
          alertStore.dismiss(alert.id);
        }
      });
    }, ALERT_POLLING_INTERVAL_IN_MS);
    return () => clearInterval(interval);
  }, [alertStore]);

  if (alertStore.alerts.length <= 0) return;
  return (
    <div className="absolute z-10 bottom-0 p-6 not-sm:w-screen sm:right-0 space-y-2">
      {alertStore.alerts.slice(-4).map((alert) => (
        <Alert key={alert.id} alert={alert} />
      ))}
    </div>
  );
}

function Alert({ alert }: { alert: AlertType }) {
  const alertStore = useAlert();

  const onDismiss = () => {
    alertStore.dismiss(alert.id);
  };

  if (alert.type === AlertTypeEnum.ERROR) {
    return (
      <button
        type="button"
        className="w-full cursor-pointer alert alert-error"
        onClick={onDismiss}
      >
        <IconCircleX className="w-6 h-6" />
        <div>
          <h3 className="font-bold">{alert.message}</h3>
          <div className="text-xs">Click to dismiss.</div>
        </div>
      </button>
    );
  }
  return (
    <button
      type="button"
      className="w-full cursor-pointer alert alert-success"
      onClick={onDismiss}
    >
      <IconCircleCheck className="w-6 h-6" />
      <div>
        <h3 className="font-bold">{alert.message}</h3>
        <div className="text-xs">Click to dismiss.</div>
      </div>
    </button>
  );
}
