export default function Chat() {
  return (
    <div className="p-6">
      <div className="chat chat-start space-y-1">
        <div className="chat-header">Obi-Wan Kenobi</div>
        <div className="chat-bubble">You were the Chosen One!</div>
        <div className="chat-footer opacity-50">Sent on 12:00PM</div>
      </div>
      <div className="chat chat-end space-y-1">
        <div className="chat-header">Anakin</div>
        <div className="chat-bubble">I hate you!</div>
        <div className="chat-footer opacity-50">Received on 12:05PM</div>
      </div>
    </div>
  )
}
