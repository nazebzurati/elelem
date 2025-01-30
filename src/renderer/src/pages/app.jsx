import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Chat from '../components/chat';
import ChatInput from '../components/chat-input';
import Navbar from '../components/navbar';
import { db } from '../lib/database';
import AddAssistantModal from '../modal/add';
import DeleteAssistantModal from '../modal/delete';
import HistoryModal from '../modal/history';
import SettingsModal from '../modal/settings';
import UpdateAssistantModal from '../modal/update';
import useSettings from '../store/settings';
import Loading from './loading';

function App() {
  const navigation = useNavigate();
  const settingsStore = useSettings();

  useEffect(() => {
    (async () => {
      const assistants = await db.assistant.toArray();
      if (assistants.length <= 0) {
        settingsStore.resetOnboardingFlag();
        navigation('/');
      } else if (assistants.length > 0 && !settingsStore.activeAssistantId) {
        settingsStore.setActiveAssistant(assistants[0].id);
      }
    })();
  }, [settingsStore.activeAssistantId, navigation]);

  const assistants = useLiveQuery(async () => await db.assistant.toArray());
  useEffect(() => {
    const shortcutTrigger = (event) => {
      if (event.altKey) {
        const index = parseInt(event.key, 10) - 1;
        if (!isNaN(index) && index >= 0 && index < assistants.length) {
          settingsStore.setActiveAssistant(assistants[index].id);
        }
      }
    };
    window.addEventListener('keydown', shortcutTrigger);
    return () => {
      window.removeEventListener('keydown', shortcutTrigger);
    };
  }, [assistants, settingsStore]);

  if (!settingsStore.activeAssistantId) return <Loading />;
  return (
    <div className="h-svh relative overflow-hidden">
      <Navbar />
      <Chat />
      <ChatInput />
      <SettingsModal />
      <AddAssistantModal />
      <UpdateAssistantModal />
      <DeleteAssistantModal />
      <HistoryModal />
    </div>
  );
}

export default App;
