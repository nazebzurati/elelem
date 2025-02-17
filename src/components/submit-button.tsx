export default function SubmitButton({
  text,
  isLoading,
}: {
  text: string;
  isLoading: boolean;
}) {
  return isLoading ? (
    <button type="submit" className="btn btn-primary flex-1">
      {text}
    </button>
  ) : (
    <button className="btn btn-primary flex-1" disabled>
      <span className="loading loading-spinner loading-sm" />
    </button>
  );
}
