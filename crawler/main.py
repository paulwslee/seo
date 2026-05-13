from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import re
from urllib.parse import urlparse

import os

app = FastAPI(title="SEO Compass Deep Crawler", version="1.0.0")

class ScanRequest(BaseModel):
    url: str
    depth: int = 1
    use_proxy: bool = False

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

async def perform_deep_scan(base_url: str, depth: int, use_proxy: bool = False):
    results = {
        "base_url": base_url,
        "media_hosts": [],
        "exposed_keys": [],
        "network_errors": [],
        "crawled_pages": [],
        "compliance": {
            "has_terms_link": False,
            "has_privacy_link": False,
            "has_contact_info": False,
            "coppa_keywords_found": []
        }
    }
    
    media_domains_set = set()
    
    # Playwright uses Cloud Run IP + Stealth Mode to bypass bots.
    proxy_settings = None
            
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, proxy=proxy_settings)
        # Emulate a modern desktop browser
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()
        
        # Apply Playwright Stealth Mode to evade bot detection
        await stealth_async(page)

        # Block heavy resources to save massive bandwidth and speed up Cloud Run
        await page.route("**/*", lambda route: route.abort() 
            if route.request.resource_type in ["image", "media", "font"] or 
               any(route.request.url.lower().endswith(ext) for ext in ['.pdf', '.zip', '.mp4', '.avi', '.mp3']) 
            else route.continue_())

        # Setup network interception handlers
        media, keys, errors = await analyze_network_traffic(page, base_url)

        try:
            # 1. Crawl Homepage
            print(f"Crawling Homepage: {base_url}")
            try:
                # Use domcontentloaded instead of networkidle to prevent infinite waits on websockets
                response = await page.goto(base_url, wait_until="domcontentloaded", timeout=25000)
            except Exception as timeout_err:
                print(f"Timeout waiting for domcontentloaded on homepage: {timeout_err}")
                response = None
                
            # Wait manually to let initial APIs load
            await page.wait_for_timeout(4000)
            
            # Extract internal links for Depth Crawling
            internal_links = await page.evaluate(f'''() => {{
                const anchors = Array.from(document.querySelectorAll('a'));
                const url = new URL('{base_url}');
                const origin = url.origin;
                return anchors
                    .filter(a => a.href)
                    .map(a => a.href)
                    .filter(href => href.startsWith(origin) && !href.includes('#'));
            }}''')
            
            # SPA Routing Detection
            spa_routing_metrics = await page.evaluate('''() => {
                const anchors = Array.from(document.querySelectorAll('a')).filter(a => a.href);
                
                const buttons = Array.from(document.querySelectorAll('button'));
                const otherClickables = Array.from(document.querySelectorAll('*')).filter(el => {
                    const style = window.getComputedStyle(el);
                    return el.tagName !== 'A' && el.tagName !== 'BUTTON' && 
                           (el.hasAttribute('onclick') || style.cursor === 'pointer' || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link');
                });
                
                return {
                    semantic_links_count: anchors.length,
                    client_side_nav_elements_count: buttons.length + otherClickables.length
                };
            }''')
            
            requires_dynamic_crawling = spa_routing_metrics["semantic_links_count"] == 0 and spa_routing_metrics["client_side_nav_elements_count"] > 0
            
            unique_links = list(set(internal_links))
            
            page_text = await page.evaluate("() => document.body ? document.body.innerText.substring(0, 1500) : ''")
            results["crawled_pages"].append({
                "url": base_url,
                "status": response.status if response else 200,
                "title": await page.title(),
                "content_preview": page_text
            })
            
            results["spa_routing_metrics"] = spa_routing_metrics
            results["requires_dynamic_crawling"] = requires_dynamic_crawling

            # 1.5 Scan for Compliance & Legal Links
            compliance_data = await page.evaluate('''() => {
                const text = document.body ? document.body.innerText.toLowerCase() : '';
                const anchors = Array.from(document.querySelectorAll('a'));
                const links = anchors.map(a => ({ text: a.innerText.toLowerCase(), href: a.href })); // Keep original href case for navigation
                
                const termsKw = ['terms', '이용약관', '약관', '利用規約', '規約', 'términos', 'condiciones'];
                const privKw = ['privacy', '개인정보', '방침', 'プライバシー', 'ポリシー', '個人情報', 'privacidad', 'política'];
                const contactKw = ['contact', 'email:', 'phone:', '고객센터', '연락처', '문의', 'お問い合わせ', '連絡先', 'contacto', 'contáctenos'];
                
                const termsLink = links.find(l => termsKw.some(kw => l.text.includes(kw) || l.href.toLowerCase().includes(kw)));
                const privLink = links.find(l => privKw.some(kw => l.text.includes(kw) || l.href.toLowerCase().includes(kw)));
                const hasContact = contactKw.some(kw => text.includes(kw)) || links.some(l => contactKw.some(kw => l.text.includes(kw) || l.href.toLowerCase().includes(kw)));
                
                // Look for clues that this might target children or mentions COPPA
                const coppaKeywords = ['coppa', 'children', 'under 13', 'kids', '어린이', '14세 미만', '아동'];
                const foundKeywords = coppaKeywords.filter(kw => text.includes(kw));

                return {
                    has_terms_link: !!termsLink,
                    terms_url: termsLink ? termsLink.href : null,
                    has_privacy_link: !!privLink,
                    privacy_url: privLink ? privLink.href : null,
                    has_contact_info: hasContact,
                    coppa_keywords_found: foundKeywords
                };
            }''')
            
            results["compliance"] = compliance_data

            # 2. Deep Click Exploration (For SPA/React apps lacking <a> tags)
            if requires_dynamic_crawling or len(unique_links) < 3:
                print("Deep Click Exploration: Triggering simulated clicks on interactive elements...")
                clickable_count = await page.evaluate('''() => {
                    const elements = Array.from(document.querySelectorAll('*'));
                    const targets = elements.filter(el => {
                        const style = window.getComputedStyle(el);
                        // Find elements that look like they route/open things, but aren't standard links
                        return el.tagName !== 'A' && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && 
                               (el.hasAttribute('onclick') || style.cursor === 'pointer' || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link');
                    });
                    
                    // Tag them for playwright to click
                    targets.forEach((el, i) => el.setAttribute('data-seo-crawler-idx', i));
                    return targets.length;
                }''')
                
                # Click up to 6 targets to explore SPA routing and trigger API calls
                for i in range(min(6, clickable_count)):
                    try:
                        print(f"Clicking interactive element {i+1}/{min(6, clickable_count)}...")
                        await page.click(f'[data-seo-crawler-idx="{i}"]', timeout=2000, force=True)
                        await page.wait_for_timeout(2500) # Wait for network requests to fire and be intercepted
                        
                        # Check if the SPA router changed the URL
                        current_url = page.url
                        if current_url != base_url:
                            results["crawled_pages"].append({
                                "url": current_url,
                                "status": 200,
                                "title": await page.title()
                            })
                            # Since go_back() is broken on this SPA, we reload the base_url to reset the state
                            await page.goto(base_url, wait_until="domcontentloaded", timeout=15000)
                            await page.wait_for_timeout(2000)
                            # Re-tag elements because the DOM refreshed
                            await page.evaluate('''() => {
                                const elements = Array.from(document.querySelectorAll('*'));
                                const targets = elements.filter(el => {
                                    const style = window.getComputedStyle(el);
                                    return el.tagName !== 'A' && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && 
                                           (el.hasAttribute('onclick') || style.cursor === 'pointer' || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link');
                                });
                                targets.forEach((el, i) => el.setAttribute('data-seo-crawler-idx', i));
                            }''')

                    except Exception as e:
                        pass # Ignore elements that are unclickable or hidden

            # 3. Crawl Subpages (Depth via traditional links)
            subpages_to_crawl = [link for link in unique_links if link != base_url][:3]
            
            # Ensure we visit legal pages if found to extract their content for AI analysis
            if compliance_data.get("terms_url") and compliance_data["terms_url"] not in subpages_to_crawl:
                if compliance_data["terms_url"].startswith(base_url):
                    subpages_to_crawl.append(compliance_data["terms_url"])
            if compliance_data.get("privacy_url") and compliance_data["privacy_url"] not in subpages_to_crawl:
                if compliance_data["privacy_url"].startswith(base_url):
                    subpages_to_crawl.append(compliance_data["privacy_url"])
            
            for sub_url in subpages_to_crawl:
                if depth > 1:
                    print(f"Crawling Subpage: {sub_url}")
                    try:
                        sub_response = await page.goto(sub_url, wait_until="domcontentloaded", timeout=15000)
                        await page.wait_for_timeout(3000)
                        
                        sub_text = await page.evaluate("() => document.body ? document.body.innerText.substring(0, 1500) : ''")
                        
                        results["crawled_pages"].append({
                            "url": sub_url,
                            "status": sub_response.status if sub_response else 200,
                            "title": await page.title(),
                            "content_preview": sub_text
                        })
                    except Exception as e:
                        print(f"Subpage timeout/error: {e}")
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
async def deep_scan_endpoint(request: ScanRequest):
    try:
        results = await perform_deep_scan(request.url, request.depth, request.use_proxy)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
