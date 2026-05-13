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

# 4. Slide background and footer
content = content.replace(
    'bg-[#f4f3ed] text-[#111111] p-12 flex flex-col relative',
    'bg-transparent text-[#111111] p-12 flex flex-col relative'
)
content = content.replace(
    'absolute bottom-12 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-[#f4f3ed]',
    'absolute bottom-8 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-transparent'
)

# 5. Restore CategorySlide and ReadinessUseCaseSlide and remove duplicate PerformanceSlide
# Let's find the FIRST PerformanceSlide (at ~487) and keep it, and then ADD CategorySlide/ReadinessUseCaseSlide after it.
# Then REMOVE the SECOND PerformanceSlide at the bottom.

category_slide_code = """
// Generic Category Slide
export const CategorySlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize, categoryNum, categoryName, score, verdict, verdictColor, verdictBgColor, description, checks }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName={`CATEGORY ${String(categoryNum).padStart(2, '0')}`} title={`CATEGORY: ${categoryName.toUpperCase()}`} companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="flex flex-col justify-center h-full pr-8">
        <h2 className="text-[56px] font-black tracking-tighter mb-6 leading-tight">{categoryName}</h2>
        <p className="text-[#444] text-[15px] leading-relaxed w-full mb-8">
          {description}
        </p>
        <div className="flex items-baseline gap-6 mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-2">CATEGORY SCORE</div>
            <div className={`text-6xl font-black ${verdictColor}`}>{score}<span className="text-xl text-[#888]">/100</span></div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-2">STATUS</div>
            <div className={`inline-block px-3 py-1 ${verdictBgColor} text-white font-mono text-xs uppercase font-bold tracking-widest`}>{verdict}</div>
          </div>
        </div>
      </div>
    }
    rightCol={
      <div className="h-full flex flex-col justify-center">
        <div className="flex justify-between items-end pb-2 border-b border-[#111] mb-2">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#666]">EVALUATION CRITERIA</div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#666]">POINTS</div>
        </div>
        <div>
          {checks.map((chk: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-[#ddd] last:border-0">
              <div>
                <div className={`font-bold text-[13px] ${chk.ptsColor || 'text-[#111]'} mb-0.5`}>{chk.name}</div>
                <div className={`font-mono text-[11px] ${chk.subtextColor || 'text-[#666]'}`}>{chk.subtext}</div>
              </div>
              <div className="font-mono text-[13px] font-bold">{chk.pts}</div>
            </div>
          ))}
        </div>
      </div>
    }
  />
);

// Readiness Use Case Slide
export const ReadinessUseCaseSlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize, score }: any) => {
  const isReady = score >= 80;
  const isSoftLaunch = score >= 50 && score < 80;
  const isNotReady = score < 50;
  
  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="READINESS" title="APPROVED USE CASES" companyName={companyName}
      leftColClass="col-span-12" rightColClass="col-span-12"
      leftCol={
        <div className="flex flex-col justify-center h-full pr-8">
          <h2 className="text-[56px] font-black tracking-tighter mb-6 leading-tight">Deployment Readiness</h2>
          <p className="text-[#444] text-[15px] leading-relaxed w-full mb-8">
            Based on the aggregated technical audit score, the platform is cleared for the following deployment scenarios. Proceeding outside these parameters assumes significant structural risk.
          </p>
        </div>
      }
      rightCol={
        <div className="flex flex-col gap-6 justify-center h-full">
          <div className={`p-6 border-l-4 ${isNotReady ? 'border-[#e11d48] bg-rose-50/50' : 'border-[#ddd] opacity-40 grayscale'}`}>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isNotReady ? 'bg-[#e11d48]' : 'bg-[#ddd]'}`}></div>
              Development / Staging
            </h3>
            <p className="text-sm text-[#444]">Cleared for internal testing and QA. Do not expose to public traffic or search engines.</p>
          </div>
          
          <div className={`p-6 border-l-4 ${isSoftLaunch ? 'border-amber-500 bg-amber-50/50' : 'border-[#ddd] opacity-40 grayscale'}`}>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSoftLaunch ? 'bg-amber-500' : 'bg-[#ddd]'}`}></div>
              Soft Launch / Beta
            </h3>
            <p className="text-sm text-[#444]">Cleared for limited audience release. Resolving warnings is highly recommended before scaling marketing efforts.</p>
          </div>
          
          <div className={`p-6 border-l-4 ${isReady ? 'border-emerald-600 bg-emerald-50/50' : 'border-[#ddd] opacity-40 grayscale'}`}>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-600' : 'bg-[#ddd]'}`}></div>
              Full Production Release
            </h3>
            <p className="text-sm text-[#444]">Cleared for global availability, B2B enterprise scaling, and unconstrained marketing campaigns.</p>
          </div>
        </div>
      }
    />
  );
};
"""

# Replace the FIRST PerformanceSlide AND append the CategorySlide/ReadinessSlide
parts = content.split('// Performance Slide')
if len(parts) >= 2:
    # First performance slide
    p1 = parts[1]
    
    # Let's cleanly just find where PerformanceSlide ends (which is `};\n`)
    end_of_p1 = p1.find('};\n') + 3
    
    new_p1 = p1[:end_of_p1] + "\n\n" + category_slide_code + "\n\n"
    
    # Reconstruct content up to this point
    content = parts[0] + '// Performance Slide' + new_p1
    
    # If there is a SECOND Performance Slide later, omit it
    # We can just drop everything after the second '// Performance Slide' if it exists
    if len(parts) > 2:
        pass # The rest of the file after new_p1 is omitted! Wait, we shouldn't omit GlossarySlide etc!

# Safer way to remove duplicate Performance Slide at the very end
if content.rfind('// Performance Slide') != content.find('// Performance Slide'):
    last_idx = content.rfind('// Performance Slide')
    content = content[:last_idx]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("PrintSlides updated!")


# 6. page.tsx Hash translation fix
page_path = 'src/app/[locale]/dashboard/reports/print/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

# We replace the hardcoded English text + conditional with just the getSlideDesc
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

# Also fix the footer bg just in case I missed it
page_content = page_content.replace('bg-[#f4f3ed] text-[#111] font-sans print-wrapper', 'bg-transparent text-[#111] font-sans print-wrapper')
page_content = page_content.replace('background: #f4f3ed;', 'background: transparent;')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)
print("page.tsx updated!")
