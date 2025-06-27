# 🎨 AuraLens

**Capture your essence. Render your vibe.**  
AuraLens is an AI-powered image filter tool that transforms your photos into stunning artistic styles using state-of-the-art AI models like Stable Diffusion + LoRA.  
Pay per render using x402pay — no accounts, no subscriptions, just instant style.

Demo video - https://youtu.be/TebHamgVr9E

---

## ✨ Features

- 📸 Upload any image (portrait, selfie, scenery)
- 🎨 Choose from 5 curated AI filters:
  - `GhibliDream` – cozy anime-style render
  - `NeoTokyo` – cyberpunk, neon city aesthetic
  - `PastelPop` – soft and vibrant palette
  - `ModernMuse` – minimalist editorial look
  - `BaroqueBlast` – classical oil painting style
- ⚡ Pay-per-use via `x402` (e.g. $0.01–$0.05 per render)
- 🧠 Fast backend inference using LoRA + Stable Diffusion
- 🔒 Private & secure – no signups or data tracking

---

## 🚀 How It Works

1. **User uploads image**
2. **Selects style filter**
3. If payment not detected, server responds with:
HTTP/1.1 402 Payment Required
X-CHAIN: base
X-ADDRESS: 0xYourCdpWallet
X-AMOUNT: 10000
X-DECIMALS: 6
X-SYMBOL: USDC
4. User retries with `X-PAYMENT` header containing Base L2 transaction.
5. Server verifies onchain payment → processes image → returns styled result.

---

## 🧩 Tech Stack

- **Frontend**: Next.js + Tailwind (PWA/mobile-first)
- **AI Backend**: FastAPI with Stable Diffusion + LoRA
- **Payments**: x402 microtransaction layer
- **Wallet**: Coinbase CDP Wallet (secure custody, future policy support)
- **Infra**: Hosted model inference (e.g. Replicate or custom A100 node)

---

## 🔄 Coming Soon: Affiliate Revenue Split

We plan to support affiliate tracking using `?ref=0xAddress` and reward users for driving traffic.  
This will be handled using **CDP Wallet’s policy engine** and **AgentKit** to split revenue automatically to referrer wallets.

✅ Not yet implemented, but fully scoped for the next version.

---

## 🧪 Challenges We Ran Into

- **x402 Integration**  
Implementing payment gating with HTTP `402` and `X-PAYMENT` headers required custom middleware and Base L2 verification. We built a retry mechanism and payment listener to streamline the flow.

- **Affiliate Splits on Base**  
We scoped affiliate support via CDP Wallets and AgentKit, but deferred implementation to focus on core rendering and payment features.


