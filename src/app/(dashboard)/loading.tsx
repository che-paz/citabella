export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-1 animate-pulse">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="h-4 w-64 rounded-md bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-muted" />
        <div className="h-28 rounded-xl bg-muted" />
      </div>
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}
