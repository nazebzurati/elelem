import Chats from "./chat";
import Navbar from "./navbar";

function Conversation() {
  return (
    <div className="h-svh flex flex-col overflow-hidden not-sm:pb-16">
      <Navbar />
      <Chats />
    </div>
  );
}

export default Conversation;
