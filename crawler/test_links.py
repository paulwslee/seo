import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        print("Navigating to URL...")
        await page.goto("https://dev.taekworld.com/masters/Dbexists?phoneNumber=7037601000", wait_until="networkidle")
        
        # Get all clickable elements (buttons, links, or elements with onclick)
        print("Evaluating elements...")
        elements = await page.evaluate('''() => {
            const result = [];
            
            // Check anchor tags
            const anchors = Array.from(document.querySelectorAll('a'));
            anchors.forEach(a => result.push({tag: 'a', href: a.href, text: a.innerText ? a.innerText.trim() : ''}));
            
            // Check buttons
            const buttons = Array.from(document.querySelectorAll('button'));
            buttons.forEach(b => result.push({tag: 'button', text: b.innerText ? b.innerText.trim() : '', onclick: b.getAttribute('onclick') || 'maybe react handler'}));
            
            // Check elements with onclick or cursor: pointer
            const others = Array.from(document.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return el.tagName !== 'A' && el.tagName !== 'BUTTON' && 
                       (el.hasAttribute('onclick') || style.cursor === 'pointer' || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link');
            });
            others.forEach(o => {
                const text = o.innerText ? o.innerText.substring(0, 50).trim() : '';
                // Try to see if it has window.location or router.push in stringified react props
                let possibleUrl = '';
                try {
                    // Very simple heuristic to find urls inside react attributes if any
                    const outer = o.outerHTML;
                    if (outer.includes('href="')) {
                        possibleUrl = outer.split('href="')[1].split('"')[0];
                    }
                } catch(e){}
                
                result.push({
                    tag: o.tagName, 
                    className: o.className,
                    text: text,
                    onclick: o.getAttribute('onclick'),
                    possibleUrl: possibleUrl
                });
            });
            
            return result;
        }''')
        
        print(f"Found {len(elements)} clickable elements:")
        for el in elements:
            if el['text'] or el.get('href') or el.get('possibleUrl') or el.get('onclick'):
                print(el)
            
        await browser.close()

asyncio.run(run())
