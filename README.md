# STORM public USDT/EGP reference

This repository contains only public market-reading code and the latest validated USDT/EGP BUY reference. No customer records, site code, API keys or account balances are stored here.

The first manual GitHub Actions run succeeded on 2026-10-20. The scheduled workflow targets one update every five minutes on standard public GitHub-hosted runners. Schedules may be delayed; this is not a real-time or availability guarantee. STORM rejects samples aged 15 minutes or more and displays its owner's manual backup when no fresh automatic source is available.

The source is Binance's public P2P BUY reference, with a filtered Vodafone Cash/InstaPay offer median as an alternative. Prices are indicative and may differ from executable offers, transfer fees and actual supplier top-up cost. The observation timestamp is preserved and never renewed by readers. Failed runs leave the previous sample unchanged.

Run locally with Node.js: `node publish-rate.mjs`. No installation, secret or paid subscription is required.
