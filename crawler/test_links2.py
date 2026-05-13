import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Loading page...")
        try:
            await page.goto("https://taekworld.com/7037601000", wait_until="networkidle", timeout=20000)
        except Exception as e:
            print("Timeout, checking links anyway...")
        links = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a')).map(a => a.href);
        }''')
        print(f"Found {len(links)} a tags")
        for l in set(links):
            print(l)
        await browser.close()

asyncio.run(run())
