import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { db } from '../lib/database';

export default function Onboard() {
  const navigation = useNavigate();
  useEffect(() => {
    db.assistant.count().then((count) => {
      if (count > 0) navigation('/app');
    });
  }, []);

  return <div className="h-svh">hello</div>;
}
