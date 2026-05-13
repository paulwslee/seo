import sys

file_path = 'src/components/dashboard/report-generator-modal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'const url = `/dashboard/reports/print\?domain=\$\{encodeURIComponent\(selectedDomain\)\}&template=\$\{template\}&paper=\$\{paperSize\}&orientation=\$\{orientation\}&vibe=\$\{includeVibe\}\$\{dateRange \? `&date=\$\{dateRange\}` : \'\'\}`;', 'const url = `/dashboard/reports/print?domain=${encodeURIComponent(selectedDomain)}&template=${template}&paper=${paperSize}&orientation=${orientation}&vibe=${includeVibe}`;', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed!")
