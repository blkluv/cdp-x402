import { CdpClient } from "@coinbase/cdp-sdk";
import { http, createPublicClient, parseEther } from "viem";
import { baseSepolia } from "viem/chains";

const cdp = new CdpClient({
  apiKeyId: "132110cc-a288-45e4-bf6f-e5920a43663e",
  apiKeySecret:
    "jeRcg31FbKb7GkvxC5fuHbmKecSdxnYjyxIs4QrAvV9QIichVgBgDjhwsNnikfTEq+91zalRiyvnIrTC7W24tg==",
  walletSecret:
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgsKdfsMywhXNmn2R4ZZuU/dyICJJD1LD7HDTIVPQQSQChRANCAATDI15kB9VR0FO4Fsn4uKuH2Gg596/0VBxEsripQnLDowMToYAOH4IhFTaPa7xR2lDVK53TAk3inIxPOjn48OE6",
});


const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const sendAffiliateReward = async (toAddress) => {
  // Step 1: Create a new EVM account.
  const account = await cdp.evm.createAccount();
  console.log("Successfully created EVM account:", account.address);

  // Step 2: Request ETH from the faucet.
  const { transactionHash: faucetTransactionHash } =
    await cdp.evm.requestFaucet({
      address: account.address,
      network: "base-sepolia",
      token: "eth",
    });

  const faucetTxReceipt = await publicClient.waitForTransactionReceipt({
    hash: faucetTransactionHash,
  });
  console.log(
    "Successfully requested ETH from faucet:",
    faucetTxReceipt.transactionHash
  );

  // Step 3: Use the v2 Wallet API to send a transaction.
  const transactionResult = await cdp.evm.sendTransaction({
    address: account.address,
    transaction: {
      to: toAddress,
      value: parseEther("0.00001"),
    },
    network: "base-sepolia",
  });

  // Step 4: Wait for the transaction to be confirmed
  const txReceipt = await publicClient.waitForTransactionReceipt({
    hash: transactionResult.transactionHash,
  });

  console.log(
    `Transaction sent! Link: https://sepolia.basescan.org/tx/${transactionResult.transactionHash}`
  );
};

fn();
