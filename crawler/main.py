from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from playwright.async_api import async_playwright
import re
from urllib.parse import urlparse

app = FastAPI(title="SEO Compass Deep Crawler", version="1.0.0")

class ScanRequest(BaseModel):
    url: str
    depth: int = 1

# Known API Key Regex Patterns
SECRET_PATTERNS = {
    "Firebase API Key": r"AIza[0-9A-Za-z-_]{35}",
    "AWS Access Key": r"(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}",
    "Stripe Secret Key": r"sk_(live|test)_[0-9a-zA-Z]{24}",
    "GitHub Token": r"(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}",
    "Slack Token": r"xox[baprs]-[0-9]{12}-[0-9]{12}-[0-9a-zA-Z]{24}",
    "SendGrid API Key": r"SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}"
}

async def analyze_network_traffic(page, url: str):
    """Intercept network traffic to find media hosts and exposed keys."""
    media_domains = set()
    exposed_keys = []
    network_errors = []

    async def handle_response(response):
        try:
            req_url = response.url
            parsed_url = urlparse(req_url)
            
            # 1. Track Third-party Media/CDN Hosts
            domain = parsed_url.netloc
            if domain and domain not in urlparse(url).netloc:
                if any(x in domain for x in ["vimeo", "youtube", "s3", "cloudfront", "storage.googleapis"]):
                    media_domains.add(domain)

            # 2. Track Network Errors (4xx, 5xx)
            if response.status >= 400:
                network_errors.append({"url": req_url, "status": response.status})

            # 3. Scan JS/JSON bodies for Secret Keys
            if response.request.resource_type in ["script", "fetch", "xhr", "document"]:
                # Only scan if content length is reasonable (e.g. < 2MB)
                content_len = int(response.headers.get("content-length", 0))
                if content_len < 2000000:
                    body_text = await response.text()
                    for key_name, pattern in SECRET_PATTERNS.items():
                        matches = re.findall(pattern, body_text)
                        if matches:
                            # Avoid duplicate logging of same key
                            for match in matches:
                                # Mask the key for DB storage
                                masked = match[:6] + "..." + match[-4:] if len(match) > 10 else match
                                entry = {"type": key_name, "masked_key": masked, "source": req_url}
                                if entry not in exposed_keys:
                                    exposed_keys.append(entry)
        except Exception:
            pass # Ignore read errors for media streams

    page.on("response", handle_response)
    return media_domains, exposed_keys, network_errors

async def perform_deep_scan(base_url: str, depth: int):
    results = {
        "base_url": base_url,
        "media_hosts": [],
        "exposed_keys": [],
        "network_errors": [],
        "crawled_pages": []
    }
    
    media_domains_set = set()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Emulate a modern desktop browser
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()

        # Setup network interception handlers
        media, keys, errors = await analyze_network_traffic(page, base_url)

        try:
            # 1. Crawl Homepage
            print(f"Crawling Homepage: {base_url}")
            response = await page.goto(base_url, wait_until="networkidle", timeout=30000)
            
            # Extract internal links for Depth Crawling
            internal_links = await page.evaluate(f'''() => {{
                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors
                    .map(a => a.href)
                    .filter(href => href.startsWith('{base_url}') && !href.includes('#'));
            }}''')
            
            unique_links = list(set(internal_links))
            results["crawled_pages"].append({
                "url": base_url,
                "status": response.status if response else 200,
                "title": await page.title()
            })

            # 2. Crawl Subpages (Depth)
            # Limit to 3 subpages to avoid massive timeouts, but deep enough to catch CSR bugs
            subpages_to_crawl = [link for link in unique_links if link != base_url][:3]
            
            for sub_url in subpages_to_crawl:
                if depth > 1:
                    print(f"Crawling Subpage: {sub_url}")
                    try:
                        sub_response = await page.goto(sub_url, wait_until="domcontentloaded", timeout=15000)
                        results["crawled_pages"].append({
                            "url": sub_url,
                            "status": sub_response.status if sub_response else 200,
                            "title": await page.title()
                        })
                    except Exception as e:
                        results["network_errors"].append({"url": sub_url, "error": str(e)})

        except Exception as e:
            results["error"] = str(e)
            
        finally:
            await browser.close()
        
        results["media_hosts"] = list(media)
        results["exposed_keys"] = keys
        results["network_errors"] = errors
        
    return results

@app.post("/api/v1/deep-scan")
async def deep_scan_endpoint(req: ScanRequest):
    try:
        data = await perform_deep_scan(req.url, req.depth)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
