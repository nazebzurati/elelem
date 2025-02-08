import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { db } from '../lib/database';
import useSettings from '../store/settings';
import Loading from './loading';

export default function Prepare() {
  const navigation = useNavigate();
  const settingsStore = useSettings();

  useEffect(() => {
    (async () => {
      const assistants = await db.assistant.toArray();
      if (assistants.length <= 0) {
        settingsStore.resetOnboardingFlag();
        navigation('/onboard');
      } else if (assistants.length > 0) {
        if (!settingsStore.activeAssistantId) settingsStore.setActiveAssistant(assistants[0].id);
        navigation('/app');
      }
    })();
  }, [settingsStore.activeAssistantId, navigation]);

  return <Loading />;
}
