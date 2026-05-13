import asyncio
from playwright.async_api import async_playwright
import re

SECRET_PATTERNS = {
    "Firebase API Key": r"AIza[0-9A-Za-z-_]{35}",
    "AWS Access Key": r"(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}",
}

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        keys = []
        
        async def handle_res(res):
            try:
                if res.request.resource_type in ["script", "fetch", "xhr", "document"]:
                    body = await res.text()
                    for k, pat in SECRET_PATTERNS.items():
                        if re.findall(pat, body):
                            keys.append(k)
            except Exception as e:
                pass

        page.on("response", handle_res)
        await page.goto("https://taekworld.com/7037601000", wait_until="networkidle")
        print("Found keys:", keys)
        await browser.close()

asyncio.run(run())
