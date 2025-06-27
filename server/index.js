// server.ts
import express from "express";
import { paymentMiddleware } from "x402-express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

dotenv.config();

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  paymentMiddleware(
    "0xAD7c065112dCF8891b10F8e70eF74F5E4A168Fa4", // Replace with your actual wallet address
    {
      "/api/generate-image": "$0.05", // Charge $0.05 for this endpoint
    }
  )
);

const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID,
  apiKeySecret: process.env.CDP_API_KEY_SECRET,
  walletSecret: process.env.CDP_WALLET_SECRET,
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

// Your protected routes
app.get("/api/protected", (req, res) => {
  res.json({ message: "This is protected content!" });
});

app.get("/api/premium/data", (req, res) => {
  res.json({ data: "Premium data here" });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

// Express POST endpoint for image generation
app.post("/api/generate-image", async (req, res) => {
  try {
    const { image, filterId } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    // Get style from request body
    const filterIdToUse = filterId || "ghibli-dream";
    const customPrompt = req.body.prompt;

    // Define style-specific prompts
    const stylePrompts = {
      "ghibli-dream":
        "Transform this image into a Studio Ghibli-style illustration with warm, hand-drawn aesthetics, soft lighting, and cozy animated storybook atmosphere",
      "neo-tokyo":
        "Convert this image into a cyberpunk Neo-Tokyo style with neon lights, futuristic elements, vibrant pink and cyan colors, and urban nighttime atmosphere",
      "modern-muse":
        "Transform this image into a minimalist, editorial portrait style with clean lines, sophisticated composition, and modern aesthetic",
      "pastel-pop":
        "Convert this image into a soft anime fashion style with dreamy pastel colors, vibrant but gentle tones, and kawaii aesthetic",
      "baroque-blast":
        "Transform this image into a classical baroque painting style with rich dramatic tones, oil-on-canvas finish, and renaissance artistic elements",
    };

    // Use custom prompt if provided, otherwise use style-specific prompt
    const fullPrompt =
      customPrompt ||
      stylePrompts[filterIdToUse] ||
      stylePrompts["ghibli-dream"];

    console.log("Starting image generation process...");
    console.log(`Filter ID: ${filterIdToUse}`);
    console.log(`Using prompt: ${fullPrompt}`);

    console.log("Sending request to OpenAI API...");
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: fullPrompt,
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${image}`,
            },
          ],
        },
      ],
      tools: [{ type: "image_generation" }],
    });
    console.log("Received response from OpenAI API");

    // Process the response
    console.log("Processing response output...");
    const imageData = response.output
      .filter((output) => output.type === "image_generation_call")
      .map((output) => output.result);

    console.log(`Found ${imageData.length} image(s) in response`);

    if (imageData.length > 0) {
      console.log("Generated image successfully!");
      const imageBase64 = imageData[0];

      // Return the generated image as base64
      res.json({
        success: true,
        image: imageBase64,
        message: response.output_text,
      });
    } else {
      console.log("No images found in response");

      res.status(500).json({
        success: false,
        error: "No images generated",
        message: response.output_text,
      });
    }

    console.log("Process completed!");
  } catch (error) {
    console.error("Error in image generation:", error);

    res.status(500).json({
      success: false,
      error: "Image generation failed",
      details: error.message,
    });
  }
});
