"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);

    const result = await resetPasswordAction(null, formData);

    setLoading(false);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.message) {
      setMessage(result.message);
    }
  }

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Set New Password</CardTitle>
        <CardDescription>Enter a secure new password for your staff account.</CardDescription>
      </CardHeader>

      {message ? (
        <CardContent className="space-y-4 text-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
            <p className="text-xs font-medium text-foreground">{message}</p>
          </div>
          <Link href="/login" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
            Proceed to Login
          </Link>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="newPassword"
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full font-semibold" disabled={loading || !token}>
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <Suspense fallback={<div className="text-center text-xs text-muted-foreground">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
