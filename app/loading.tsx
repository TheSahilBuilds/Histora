export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-bronze border-t-transparent" />
        <p className="font-display text-lg text-ink-muted">The archive is loading...</p>
      </div>
    </div>
  );
}