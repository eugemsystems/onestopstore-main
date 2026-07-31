const NotificationsLoading = () => {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 bg-muted rounded mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-lg border border-border"
          >
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsLoading;
