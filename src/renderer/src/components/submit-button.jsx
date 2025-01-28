import { IconCheck } from '@tabler/icons-react';

import { useEffect, useState } from 'react';

const BUTTON_ANIMATION_TIMEOUT = 3000;

export default function SubmitButton({ isLoading, isSubmitted, onClick, text }) {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    if (isSubmitted) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
      }, BUTTON_ANIMATION_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  if (isActive && isSubmitted) {
    return (
      <button type="button" className="btn btn-success flex-1">
        <IconCheck className="w-4 h-4" />
      </button>
    );
  }
  return (
    <button type="submit" className="btn btn-primary flex-1" disabled={isLoading} onClick={onClick}>
      {!isLoading ? text : <span className="loading loading-spinner loading-sm" />}
    </button>
  );
}
