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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GET_TRANSACTION_HISTORY } from "./transaction-history";

const GET_PAYMENT_PACKAGES = gql`
  query GetPaymentPackages {
    paymentPackages {
      id
      price
      credits
      name
      description
      allowMultiple
    }
  }
`;

const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
    createPaymentIntent(input: $input) {
      transactionId
      paypalOrderId
      gcashPaymentId
      qrCode
    }
  }
`;

// const CONFIRM_PAYMENT = gql`
//   mutation ConfirmPayment($input: ConfirmPaymentInput!) {
//     confirmPayment(input: $input)
//   }
// `;

interface PaymentPackage {
  id: string;
  price: number;
  credits: number;
  name: string;
  description: string;
  allowMultiple: boolean;
}

export function PaymentPackages() {
  const [selectedProvider, setSelectedProvider] = useState<string>("PAYPAL");
  const [multiplier, setMultiplier] = useState<{ [key: string]: number }>({});
  const [transactionIds, setTransactionIds] = useState<{
    [key: string]: string;
  }>({});
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );
  const [paymentStep, setPaymentStep] = useState<{
    [key: string]: "input" | "payment" | "confirm";
  }>({});

  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_PAYMENT_PACKAGES);
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);

  const handleProceedToPayment = async (pkg: PaymentPackage) => {
    if (!selectedProvider) {
      toast({
        title: "Error",
        description: "Please select a payment provider",
        variant: "destructive",
      });
      return;
    }

    if (!transactionIds[pkg.id]) {
      toast({
        title: "Error",
        description: "Please enter a transaction ID",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(pkg.id);

    try {
      const currentMultiplier = multiplier[pkg.id] || 1;

      await createPaymentIntent({
        variables: {
          input: {
            packageType: pkg.id,
            paymentProvider: selectedProvider,
            multiplier: currentMultiplier,
            transactionId: transactionIds[pkg.id],
          },
        },
        refetchQueries: [
          {
            query: GET_TRANSACTION_HISTORY,
            variables: { limit: 20, offset: 0 },
          },
        ],
      });

      setProcessingPayment(pkg.id);
      toast({
        title: "Payment Submitted!",
        description:
          "Your payment has been submitted for admin review. Credits will be added once approved.",
      });

      // Reset form
      setPaymentStep((prev) => ({ ...prev, [pkg.id]: "input" }));
      setTransactionIds((prev) => ({ ...prev, [pkg.id]: "" }));

      // Refetch wallet data
      refetch();
      //setPaymentStep((prev) => ({ ...prev, [pkg.id]: "payment" }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment intent: " + (error ? error : ""),
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const packages: PaymentPackage[] = data?.paymentPackages || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Purchase Credits</h2>
        <p className="text-muted-foreground">
          Choose a package to add credits to your wallet
        </p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">
          Payment Provider
        </label>
        <div className="flex gap-4">
          <Button
            variant={selectedProvider === "PAYPAL" ? "default" : "outline"}
            onClick={() => setSelectedProvider("PAYPAL")}
            className="flex items-center gap-2 h-12"
          >
            <img
              src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
              alt="PayPal"
              className="h-6"
            />
          </Button>
          <Button
            variant={selectedProvider === "GCASH" ? "default" : "outline"}
            onClick={() => setSelectedProvider("GCASH")}
            className="flex items-center gap-2 h-12"
          >
            <img
              src="https://logos-world.net/wp-content/uploads/2022/03/GCash-Logo.png"
              alt="GCash"
              className="h-6"
            />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => {
          const currentMultiplier = multiplier[pkg.id] || 1;
          const totalPrice = pkg.price * currentMultiplier;
          const totalCredits = pkg.credits * currentMultiplier;
          const currentStep = paymentStep[pkg.id] || "input";

          return (
            <Card key={pkg.id} className="relative">
              {pkg.id === "15" && (
                <Badge className="absolute -top-2 left-4 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  {pkg.name}
                </CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">${totalPrice}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalCredits.toLocaleString()} credits
                  </div>
                  {pkg.allowMultiple && (
                    <div className="flex items-center justify-center gap-2">
                      <Label>Quantity</Label>
                      <Select
                        value={currentMultiplier.toString()}
                        onValueChange={(value) =>
                          setMultiplier((prev) => ({
                            ...prev,
                            [pkg.id]: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x - ${pkg.price * num} (
                              {(pkg.credits * num).toLocaleString()} credits)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {currentStep === "input" && (
                  <div className="space-y-4">
                    {selectedProvider === "PAYPAL" && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Click the PayPal button below to complete your payment
                        </p>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `
                              <style>.pp-4585S3JFG2YB4{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}</style>
                              <form action="https://www.paypal.com/ncp/payment/4585S3JFG2YB4" method="post" target="_blank" style="display:inline-grid;justify-items:center;align-content:start;gap:0.5rem;">
                                <input class="pp-4585S3JFG2YB4" type="submit" value="Pay Now" />
                                <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" />
                                </form>
                            `,
                          }}
                        />
                      </div>
                    )}

                    {selectedProvider === "GCASH" && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Scan the QR code below with your GCash app
                        </p>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=gcash://pay?amount=${totalPrice}`}
                          alt="GCash QR Code"
                          className="mx-auto border rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Amount: ${totalPrice}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === "input" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        After payment, enter the{" "}
                        {selectedProvider === "GCASH"
                          ? `Reference ID`
                          : `Transaction ID`}{" "}
                        below
                      </p>
                      <Label>
                        {selectedProvider === "GCASH"
                          ? `Reference ID`
                          : `Transaction ID`}
                      </Label>
                      <Input
                        placeholder={
                          selectedProvider === "GCASH"
                            ? `Enter your Reference ID`
                            : `Enter your Transaction ID`
                        }
                        value={transactionIds[pkg.id] || ""}
                        onChange={(e) =>
                          setTransactionIds((prev) => ({
                            ...prev,
                            [pkg.id]: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleProceedToPayment(pkg)}
                      disabled={
                        !selectedProvider ||
                        !transactionIds[pkg.id] ||
                        processingPayment === pkg.id
                      }
                    >
                      {processingPayment === pkg.id ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Confirm Payment
                        </div>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
