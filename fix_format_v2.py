import re

file_path = 'src/app/[locale]/dashboard/reports/print/PrintSlides.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. CheckRow py-4 to py-3
content = content.replace('className="flex justify-between items-end py-4 border-b border-[#ddd]', 
                          'className="flex justify-between items-end py-3 border-b border-[#ddd]')

# 2. Add col-span-12 to slides
def add_col_span(section_name, code):
    return re.sub(
        rf'(sectionName="{section_name}".*?companyName={{companyName}}\s*)leftCol={{',
        r'\1leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol={',
        code, flags=re.DOTALL
    )

content = add_col_span('WARNINGS', content)
content = add_col_span('PROJECTED TRAJECTORY', content)
content = add_col_span('LEGAL COUNSEL REQUIRED', content)
content = add_col_span('COPPA EXPOSURE', content)
content = add_col_span('INDUSTRY PRECEDENT', content)
content = add_col_span('APPENDIX', content)

# BlockerSlide doesn't use sectionName="BLOCKER" literal exactly, it uses dynamic.
content = re.sub(
    r'(title={`BLOCKER \$\{String\(index\)\.padStart\(2, \'0\'\)\} · FIX IMMEDIATELY`}\s*companyName=\{companyName\}\s*)leftCol=\{',
    r'\1leftColClass="col-span-12" rightColClass="col-span-12"\n    leftCol={',
    content, flags=re.DOTALL
)

# 3. WarningSlide remove space-y-3
content = content.replace('<div className="space-y-3">\n          {warnings.map', '<div>\n          {warnings.map')

# 4. Slide background and footer - THIS IS IN PrintSlides.tsx `print-page` div!
# Wait, let's fix it inside PrintSlides.tsx `export const Slide`
content = content.replace(
    'className={`print-page mx-auto shadow-2xl bg-[#f4f3ed] text-[#111111] p-12 flex flex-col relative overflow-hidden box-border`}',
    'className={`print-page mx-auto shadow-2xl bg-transparent text-[#111111] p-12 flex flex-col relative overflow-hidden box-border`}'
)
content = content.replace(
    'className="absolute bottom-12 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-[#f4f3ed] pt-4 items-center"',
    'className="absolute bottom-8 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-transparent pt-4 items-center"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)


# 5. page.tsx Hash translation fix and footer fix for hash slide
page_path = 'src/app/[locale]/dashboard/reports/print/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

old_hash_block = '''<p className={`text-sm text-[#ccc] leading-relaxed ${locale !== 'en' ? 'mb-2' : 'mb-8'}`}>
               This report's underlying raw technical data was cryptographically sealed at the time of scanning. Alteration of the original telemetry will invalidate this SHA-256 fingerprint.
             </p>
             {locale !== 'en' && (
               <p className="text-sm text-[#999] leading-relaxed mb-8">
                 {getSlideDesc(locale, 'hash')}
               </p>
             )}'''

new_hash_block = '''<p className="text-sm text-[#ccc] leading-relaxed mb-8">
               {getSlideDesc(locale || 'en', 'hash')}
             </p>'''

page_content = page_content.replace(old_hash_block, new_hash_block)

page_content = page_content.replace('bg-[#f4f3ed] text-[#111] font-sans print-wrapper', 'bg-transparent text-[#111] font-sans print-wrapper')
page_content = page_content.replace('background: #f4f3ed;', 'background: transparent;')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Formatting applied!")
