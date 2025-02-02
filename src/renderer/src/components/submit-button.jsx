import { IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export const BUTTON_ANIMATION_TIMEOUT = 2000;

export default function SubmitButton({ formId, isLoading, isSubmitted, isFailed, text }) {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    if (isSubmitted || isFailed) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
      }, BUTTON_ANIMATION_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, isFailed]);

  if (isActive && !isFailed) {
    return (
      <button type="button" className="btn flex-1 btn-success">
        <IconCheck className="w-4 h-4" />
      </button>
    );
  }
  return (
    <button form={formId} type="submit" className="btn btn-primary flex-1" disabled={isLoading}>
      {!isLoading ? text : <span className="loading loading-spinner loading-sm" />}
    </button>
  );
}
