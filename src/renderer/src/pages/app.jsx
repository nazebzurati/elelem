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

function App() {
  const settings = useSettings();
  const navigation = useNavigate();
  useEffect(() => {
    db.assistant.count().then((count) => {
      if (count <= 0) {
        settings.resetOnboardingFlag();
        navigation('/');
      }
    });
  }, []);

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
