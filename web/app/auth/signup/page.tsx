import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ListTodo } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          <span className="font-semibold">Todo App</span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center py-12">
        <AuthForm mode="signup" />
      </div>
      <div className="container flex h-16 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}