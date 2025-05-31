export function StatusBadge({ status }: { status: string }) {
  const baseClasses = "px-2 py-1 rounded-full text-sm";
  const statusStyles = {
    available:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    deployed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    unavailable: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  const style =
    statusStyles[status as keyof typeof statusStyles] ||
    "bg-gray-100 text-gray-800";

  return (
    <span className={`${baseClasses} ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
