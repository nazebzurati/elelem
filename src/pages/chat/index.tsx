import AboutModal from "./about";
import Chats from "./chat";
import HistoryModal from "./history";
import Navbar from "./navbar";

function Chat() {
  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Navbar />
      <Chats />
      <HistoryModal />
      <AboutModal />
    </div>
  );
}

export default Chat;
