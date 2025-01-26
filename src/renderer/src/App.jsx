import Chat from './components/chat'
import ChatInput from './components/chat-input'
import Navbar from './components/navbar'

function App() {
  return (
    <div className="h-svh relative">
      <Navbar />
      <Chat />
      <ChatInput />
    </div>
  )
}

export default App
