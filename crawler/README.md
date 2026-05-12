# SEO Compass - Python Deep Crawler Microservice

This service is a standalone Python FastAPI application that performs a deep technical scan of target websites. It utilizes Microsoft Playwright to spawn a headless Chromium instance, intercept network traffic, and scan for exposed secrets.

## Features
- **Depth Crawling:** Extracts internal links from the homepage and visits subpages to catch Client-Side Rendering (CSR) failures.
- **Network Interception:** Analyzes XHR and JS responses to discover CDN/Media streaming providers (e.g., Vimeo, AWS S3).
- **Secret Scanner:** Scans all intercepted text bodies (JS files, JSON APIs) using Regex patterns to find exposed Firebase, Stripe, AWS, and GitHub API keys.

## Local Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Playwright Browsers:**
   ```bash
   playwright install chromium
   ```

3. **Run the server:**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`.

## Production Deployment (Google Cloud Run)
This service is designed to be deployed to Google Cloud Run to leverage the 2M free requests per month tier, bypassing the standard 5-minute timeout limitations of serverless environments like Vercel.
