export function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    ></div>
  );
}
