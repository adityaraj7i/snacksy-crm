"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BUSINESS_NAME } from "@/lib/constants";
import { Coffee, Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(null, formData);

    setLoading(false);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.message) {
      setMessage(result.message);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Coffee className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{BUSINESS_NAME}</h1>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive password reset instructions.</CardDescription>
          </CardHeader>

          {message ? (
            <CardContent className="space-y-4 text-center">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-8 w-8" />
                <p className="text-xs font-medium text-foreground">{message}</p>
              </div>
              <Link href="/login" className="inline-flex items-center text-xs text-primary font-semibold hover:underline">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Login
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
                  <label className="text-xs font-medium text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input name="email" type="email" placeholder="staff@snacksy.local" required className="pl-9" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 pt-2">
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? "Sending Instructions..." : "Send Reset Instructions"}
                </Button>
                <Link href="/login" className="inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to Sign In
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
