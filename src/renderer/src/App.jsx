import SettingsModal from './modal/settings'
import Chat from './components/chat'
import ChatInput from './components/chat-input'
import Navbar from './components/navbar'
import AddAssistantModal from './modal/add'
import UpdateAssistantModal from './modal/update'
import HistoryModal from './modal/history'

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
  )
}

export default App
