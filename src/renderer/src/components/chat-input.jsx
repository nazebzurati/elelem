export default function ChatInput() {
  return (
    <div className="w-svw absolute bottom-0 left-0 p-6">
      <fieldset className="fieldset ">
        <legend className="fieldset-legend">Your message</legend>
        <textarea className="textarea w-100" />
        <div className="fieldset-label">Shift+Enter to send.</div>
      </fieldset>
    </div>
  )
}
