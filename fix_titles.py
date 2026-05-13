import re

with open('src/app/[locale]/dashboard/reports/print/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace all occurrences of 01 ·, 02 · etc.
text = re.sub(r'(page[1-6]Title:\s*\")[0-9]{2}\s*·\s*(.*?)\"', r'\1\2"', text)
text = re.sub(r'(appendixTitle:\s*\".*?)\s*·\s*(.*?)\"', r'\1 - \2"', text)

with open('src/app/[locale]/dashboard/reports/print/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
