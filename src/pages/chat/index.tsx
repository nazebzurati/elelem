import Chats from "./chat";
import Navbar from "./navbar";

function Chat() {
  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Navbar />
      <Chats />
    </div>
  );
}

export default Chat;
