"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Coins } from "lucide-react";

const GET_WALLET = gql`
  query GetWallet {
    myWallet {
      id
      credits
    }
  }
`;

export function WalletDisplay() {
  const { data, loading } = useQuery(GET_WALLET, {
    fetchPolicy: "cache-and-network",
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Coins className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const credits = data?.myWallet?.credits || 0;

  return (
    <div className="flex items-center gap-2 text-foreground">
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-medium">{credits.toLocaleString()}</span>
    </div>
  );
}