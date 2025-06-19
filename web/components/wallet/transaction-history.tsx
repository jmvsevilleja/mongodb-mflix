"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";

export const GET_TRANSACTION_HISTORY = gql`
  query GetTransactionHistory($limit: Int, $offset: Int) {
    transactionHistory(limit: $limit, offset: $offset) {
      id
      type
      amount
      credits
      status
      paymentProvider
      packageType
      multiplier
      description
      createdAt
    }
  }
`;

interface Transaction {
  id: string;
  type: "DEPOSIT" | "DEBIT";
  amount: number;
  credits: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paymentProvider?: "STRIPE" | "PAYPAL" | "PAYMONGO";
  packageType?: string;
  multiplier: number;
  description?: string;
  createdAt: string;
}

export function TransactionHistory() {
  const { data, loading } = useQuery(GET_TRANSACTION_HISTORY, {
    variables: { limit: 20, offset: 0 },
  });

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const transactions: Transaction[] = data?.transactionHistory || [];

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No transactions yet. Purchase credits to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent wallet transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {transaction.type === "DEPOSIT" ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {transaction.description ||
                      `${
                        transaction.type === "DEPOSIT"
                          ? "Credit Purchase"
                          : "Credit Usage"
                      }`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(transaction.createdAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </p>
                  {transaction.paymentProvider && (
                    <p className="text-xs text-muted-foreground">
                      via {transaction.paymentProvider}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      transaction.type === "DEPOSIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "DEPOSIT" ? "+" : "-"}
                    {transaction.credits} credits
                  </span>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
                {transaction.amount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    ${transaction.amount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
