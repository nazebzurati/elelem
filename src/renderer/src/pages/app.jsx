import Chat from '../components/chat';
import ChatInput from '../components/chat-input';
import Navbar from '../components/navbar';
import AddAssistantModal from '../modal/add';
import HistoryModal from '../modal/history';
import SettingsModal from '../modal/settings';
import UpdateAssistantModal from '../modal/update';

function App() {
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
