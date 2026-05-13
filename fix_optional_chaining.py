import re

file_path = 'src/app/[locale]/dashboard/reports/print/PrintSlides.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix PerformanceSlide
content = content.replace('title={t.page3Title || "CATEGORY: PERFORMANCE"}', 'title={t?.page3Title || "CATEGORY: PERFORMANCE"}')

# Fix MethodologySlide
content = content.replace('sectionName={t.page1Title.split', 'sectionName={t?.page1Title?.split')
content = content.replace('title={t.page1Title}', 'title={t?.page1Title || "METHODOLOGY"}')
content = content.replace('{t.page1Title.split', '{t?.page1Title?.split')
content = content.replace('{t.methodValue}', '{t?.methodValue}')
content = content.replace('{t.accessExplanation}', '{t?.accessExplanation}')
content = content.replace('{t.track1}', '{t?.track1}')
content = content.replace('{t.track1Desc}', '{t?.track1Desc}')
content = content.replace('{t.track2}', '{t?.track2}')
content = content.replace('{t.track2Desc}', '{t?.track2Desc}')
content = content.replace('{t.track3}', '{t?.track3}')
content = content.replace('{t.track3Desc}', '{t?.track3Desc}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed optional chaining!")
