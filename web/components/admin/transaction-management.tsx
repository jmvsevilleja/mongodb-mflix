"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const GET_ADMIN_TRANSACTIONS = gql`
  query GetAdminTransactions($limit: Int, $offset: Int, $status: String) {
    adminTransactions(limit: $limit, offset: $offset, status: $status) {
      transactions {
        id
        type
        amount
        credits
        status
        paymentProvider
        packageType
        multiplier
        description
        adminNote
        processedBy
        processedAt
        userName
        userEmail
        transactionId
        createdAt
      }
      totalCount
      hasMore
    }
  }
`;

const PROCESS_TRANSACTION = gql`
  mutation ProcessTransaction($input: ProcessTransactionInput!) {
    processTransaction(input: $input)
  }
`;

interface AdminTransaction {
  id: string;
  type: string;
  amount: number;
  credits: number;
  status: string;
  paymentProvider?: string;
  packageType?: string;
  multiplier: number;
  description?: string;
  adminNote?: string;
  processedBy?: string;
  processedAt?: string;
  userName: string;
  userEmail: string;
  transactionId?: string;
  createdAt: string;
}

export function TransactionManagement() {
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [processingTransaction, setProcessingTransaction] = useState<
    string | null
  >(null);
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_ADMIN_TRANSACTIONS, {
    variables: {
      limit: 50,
      offset: 0,
      status: selectedStatus,
    },
    fetchPolicy: "cache-and-network",
  });

  const [processTransaction] = useMutation(PROCESS_TRANSACTION, {
    onCompleted: () => {
      refetch();
      setProcessingTransaction(null);
      toast({
        title: "Success",
        description: "Transaction processed successfully",
      });
    },
    onError: (error) => {
      setProcessingTransaction(null);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProcessTransaction = async (
    transactionId: string,
    action: "APPROVE" | "REJECT",
    adminNote?: string
  ) => {
    setProcessingTransaction(transactionId);

    try {
      await processTransaction({
        variables: {
          input: {
            transactionId,
            action,
            adminNote,
          },
        },
      });
    } catch (error) {
      console.error("Error processing transaction:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "FAILED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case "PAYPAL":
        return (
          <img
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg\"
            alt="PayPal\"
            className="h-4"
          />
        );
      case "GCASH":
        return (
          <img
            src="https://logos-world.net/wp-content/uploads/2022/03/GCash-Logo.png\"
            alt="GCash\"
            className="h-4"
          />
        );
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions: AdminTransaction[] =
    data?.adminTransactions?.transactions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Management</CardTitle>
        <CardDescription>
          Review and process user payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
            <TabsTrigger value="ALL">All</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No transactions found</h3>
                <p className="text-muted-foreground">
                  No {selectedStatus.toLowerCase()} transactions at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {transaction.userName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({transaction.userEmail})
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getProviderIcon(transaction.paymentProvider)}
                            <span className="text-sm">
                              {transaction.paymentProvider || "Unknown"}
                            </span>
                          </div>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>

                        {transaction.transactionId && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm">
                              <strong>User Transaction ID:</strong>{" "}
                              {transaction.transactionId}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            <strong>Amount:</strong> $
                            {transaction.amount.toFixed(2)}
                          </span>
                          <span>
                            <strong>Credits:</strong>{" "}
                            {transaction.credits.toLocaleString()}
                          </span>
                          {transaction.multiplier > 1 && (
                            <span>
                              <strong>Quantity:</strong>{" "}
                              {transaction.multiplier}x
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Created:{" "}
                          {format(
                            new Date(transaction.createdAt),
                            "MMM dd, yyyy 'at' h:mm a"
                          )}
                        </p>

                        {transaction.processedAt && (
                          <p className="text-xs text-muted-foreground">
                            Processed:{" "}
                            {format(
                              new Date(transaction.processedAt),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                            {transaction.processedBy &&
                              ` by ${transaction.processedBy}`}
                          </p>
                        )}

                        {transaction.adminNote && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm">
                              <strong>Admin Note:</strong>{" "}
                              {transaction.adminNote}
                            </p>
                          </div>
                        )}
                      </div>

                      {transaction.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() =>
                              handleProcessTransaction(
                                transaction.id,
                                "APPROVE",
                                "Approved by admin"
                              )
                            }
                            disabled={processingTransaction === transaction.id}
                          >
                            {processingTransaction === transaction.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleProcessTransaction(
                                transaction.id,
                                "REJECT",
                                "Rejected by admin"
                              )
                            }
                            disabled={processingTransaction === transaction.id}
                          >
                            {processingTransaction === transaction.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
