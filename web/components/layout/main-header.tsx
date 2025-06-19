"use client";

import { ListTodo, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { WalletDisplay } from "@/components/wallet/wallet-display";
import { UserAvatar } from "@/components/user-avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export function MainHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          <span className="font-semibold">Face App</span>
        </div>

        <Navigation />

        <div className="flex items-center gap-4">
          {session ? <WalletDisplay /> : null}
          {session ? <UserAvatar /> : null}
          <ThemeToggle />
          {session ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
