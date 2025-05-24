export default function SubmitButton({
  text,
  formId,
  isLoading,
}: {
  text: string;
  formId?: string;
  isLoading: boolean;
}) {
  return !isLoading ? (
    <button form={formId} type="submit" className="btn btn-primary flex-1">
      {text}
    </button>
  ) : (
    <button type="button" className="btn btn-primary flex-1" disabled>
      <span className="loading loading-spinner loading-sm" />
    </button>
  );
}
