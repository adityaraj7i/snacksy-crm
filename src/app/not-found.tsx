import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="max-w-md space-y-4 rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <h2 className="text-xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
