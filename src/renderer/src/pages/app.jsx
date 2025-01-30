import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Chat from '../components/chat';
import ChatInput from '../components/chat-input';
import Navbar from '../components/navbar';
import { db } from '../lib/database';
import AddAssistantModal from '../modal/add';
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

  if (!settingsStore.activeAssistantId) return <Loading />;
  return (
    <div className="h-svh relative overflow-hidden">
      <Navbar />
      <Chat />
      <ChatInput />
      <SettingsModal />
      <AddAssistantModal />
      <UpdateAssistantModal />
      <HistoryModal />
    </div>
  );
}

export default App;
