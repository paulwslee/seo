# Python Crawler Setup & Usage Guide

This project utilizes a high-performance Python Playwright microservice to perform deep external Technical SEO auditing, COPPA compliance checking, and vulnerability footprinting. The Next.js frontend communicates with this local crawler.

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Python 3.10+** (Python 3.12 or 3.13 recommended)
- **Node.js** (v18 or higher) for the Next.js frontend

## 2. Installation Steps

Navigate to the `crawler` directory and install the required dependencies:

```bash
cd crawler

# Create a virtual environment (optional but highly recommended)
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Install Playwright browsers (CRITICAL STEP)
# This downloads the necessary Chromium binaries for headless scraping.
playwright install
```

## 3. Running the Crawler Service

To start the FastAPI crawler microservice, run:

```bash
python main.py
```

You should see the following output indicating the server is running successfully:
```text
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## 4. Troubleshooting

### Timeout Errors
If you see timeout errors during crawling (especially on live domains), this means the target website is blocking headless browsers or takes too long to load.
- Ensure `playwright install` was run successfully.
- Check if the site uses Cloudflare Bot Protection (which may block Playwright).

### Connection Refused (`{"detail":"Not Found"}`)
- By default, the Next.js app communicates with the crawler via `http://127.0.0.1:8000` or `http://localhost:8000`.
- Ensure Next.js is not blocking local network requests if you are using Docker.

### Python Version Metadata Error (`metadata-generation-failed`)
- If you encounter errors while installing `pydantic-core` or other libraries, ensure your `pip` is updated to the latest version (`python -m pip install --upgrade pip`).
- We have unpinned strict versions in `requirements.txt` to maintain compatibility with Python 3.13.

## 5. Deployment
In production, this crawler should be deployed to a containerized environment (e.g., Google Cloud Run, AWS App Runner, or a VPS) and the internal URL should be updated in the Next.js environment variable `PYTHON_CRAWLER_URL`.
