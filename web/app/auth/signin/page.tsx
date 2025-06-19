import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ListTodo } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          <span className="font-semibold">Todo App</span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center py-12">
        <AuthForm mode="signin" />
      </div>
      <div className="container flex h-16 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}