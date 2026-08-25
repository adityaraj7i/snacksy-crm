"use client";

// Client-callable Server Actions wrappers calling server endpoints or server functions
import { loginServerAction, logoutServerAction, forgotPasswordServerAction, resetPasswordServerAction } from "./server-actions";

export async function loginAction(prevState: any, formData: FormData) {
  return loginServerAction(prevState, formData);
}

export async function logoutAction() {
  return logoutServerAction();
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  return forgotPasswordServerAction(prevState, formData);
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  return resetPasswordServerAction(prevState, formData);
}
