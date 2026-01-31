export function ProgressBar({
  progress,
  className = "bg-white/20 rounded-full h-2",
  barClassName = "bg-amber-500 h-2 rounded-full"
}) {
  return (
    <div className={className}>
      <div
        className={`${barClassName} transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
