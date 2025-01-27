import SettingsModal from './modal/settings'
import Chat from './components/chat'
import ChatInput from './components/chat-input'
import Navbar from './components/navbar'

function App() {
  return (
    <div className="h-svh relative overflow-hidden">
      <Navbar />
      <Chat />
      <ChatInput />
      <SettingsModal />
    </div>
  )
}

export default App
