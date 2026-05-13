import re

page_path = 'src/app/[locale]/dashboard/reports/print/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

page_content = page_content.replace(
    '<PerformanceSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} performanceData={performanceData} />',
    '<PerformanceSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} performanceData={performanceData} t={t} />'
)

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Passed t to PerformanceSlide!")
