import re

file_path = 'src/app/[locale]/dashboard/reports/print/PrintSlides.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CheckRow py-4 to py-3
content = content.replace('className="flex justify-between items-end py-4 border-b border-[#ddd]', 
                          'className="flex justify-between items-end py-3 border-b border-[#ddd]')

# 2. Add col-span-12 to BlockerSlide
if 'sectionName={`BLOCKER ${String(index).padStart(2, \'0\')}`}' in content and 'leftColClass' not in content.split('export const BlockerSlide')[1].split('/>')[0]:
    content = content.replace('companyName={companyName}\n    leftCol=', 'companyName={companyName}\n    leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol=')

# 3. Add col-span-12 to WarningSlide
if 'sectionName="WARNINGS"' in content and 'leftColClass' not in content.split('export const WarningSlide')[1].split('/>')[0]:
    content = content.replace('companyName={companyName}\n    leftCol=', 'companyName={companyName}\n    leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol=')
# Also remove space-y-3 in WarningSlide
content = content.replace('<div className="space-y-3">\n          {warnings.map', '<div>\n          {warnings.map')

# 4. Add col-span-12 to TrajectorySlide
if 'sectionName="PROJECTED TRAJECTORY"' in content and 'leftColClass' not in content.split('export const TrajectorySlide')[1].split('/>')[0]:
    content = content.replace('companyName={companyName}\n    leftCol=', 'companyName={companyName}\n    leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol=')

# 5. Add col-span-12 to LegalSlide
if 'sectionName="LEGAL COUNSEL REQUIRED"' in content and 'leftColClass' not in content.split('export const LegalSlide')[1].split('/>')[0]:
    content = content.replace('companyName={companyName}\n    leftCol=', 'companyName={companyName}\n    leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol=')

# 6. Add col-span-12 to CoppaSlide
if 'sectionName="COPPA EXPOSURE"' in content and 'leftColClass' not in content.split('export const CoppaSlide')[1].split('/>')[0]:
    content = content.replace('companyName={companyName}\n    leftCol=', 'companyName={companyName}\n    leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol=')

# 7. Add col-span-12 to IndustryPrecedentSlide
if 'sectionName="INDUSTRY PRECEDENT"' in content and 'leftColClass' not in content.split('export const IndustryPrecedentSlide')[1].split('/>')[0]:
    content = content.replace('companyName={companyName}\n    leftCol=', 'companyName={companyName}\n    leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol=')

# 8. Add col-span-12 to AppendixSlide
if 'sectionName="APPENDIX"' in content and 'leftColClass' not in content.split('export const AppendixSlide')[1].split('/>')[0]:
    content = content.replace('companyName={companyName}\n    leftCol=', 'companyName={companyName}\n    leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol=')

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("PrintSlides updated!")

# Update page.tsx for footer bg and bottom-12 -> bottom-8
page_path = 'src/app/[locale]/dashboard/reports/print/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

page_content = page_content.replace('bg-[#f4f3ed] text-[#111111] p-12 flex flex-col relative', 'bg-transparent text-[#111111] p-12 flex flex-col relative')
page_content = page_content.replace('absolute bottom-12 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-[#f4f3ed]', 'absolute bottom-8 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-transparent')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)
print("page.tsx updated!")
