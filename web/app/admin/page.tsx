"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  ListTodo,
  LogOut,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";
import { TransactionManagement } from "@/components/admin/transaction-management";
import Link from "next/link";

const GET_TRANSACTION_STATS = gql`
  query GetTransactionStats {
    transactionStats {
      totalTransactions
      pendingTransactions
      completedTransactions
      rejectedTransactions
      totalRevenue
      pendingRevenue
    }
  }
`;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: statsData, loading: statsLoading } = useQuery(
    GET_TRANSACTION_STATS,
    {
      skip: status !== "authenticated",
    }
  );

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/admin/login");
    return null;
  }

  // Check if user is admin (this should be validated on the backend)
  if (session?.user?.email !== "admin@example.com") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>You don&apos;t have permission to access this page.</p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = statsData?.transactionStats;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ListTodo className="h-6 w-6" />
              <span className="font-semibold">Todo App - Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Admin: {session?.user?.name || session?.user?.email}
            </p>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage transactions and monitor system activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalTransactions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statsLoading ? "..." : stats?.pendingTransactions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                $
                {statsLoading ? "..." : (stats?.pendingRevenue || 0).toFixed(2)}{" "}
                pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? "..." : stats?.completedTransactions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${statsLoading ? "..." : (stats?.totalRevenue || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Management */}
        <TransactionManagement />
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Todo App Admin Panel. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
