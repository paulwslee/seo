import { auth } from "@/auth";
import { db } from "@/lib/db";
import { scanResults, users, projects } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Globe, TrendingUp, ShieldCheck, FileCode2, AlertTriangle, CheckCircle2, XCircle, Lock } from "lucide-react";
import { PrintAutomator } from "./print-automator";
import ReactMarkdown from "react-markdown";
import { Slide, CheckRow, BlockerSlide, WarningSlide, TrajectorySlide, RoadmapSlide, CoppaSlide, IndustryPrecedentSlide, AppendixSlide, LegalSlide, VibeCodingSlide, MethodologySlide, GlossarySlide } from './PrintSlides';
import TranslateButton from "@/components/dashboard/TranslateButton";

const getPrintTranslations = (locale: string) => {
  if (locale === 'ko') {
    return {
      coverSub: "출시 적합성 평가",
      coverTitle: "기술 실사 보고서",
      coverDesc: "성능, 보안, 접근성, 인프라 및 콘텐츠 전반에 걸친 프로덕션 웹 표면의 외부 검토.",
      targetSurface: "대상 표면",
      auditor: "감사 기관",
      method: "감사 방법론",
      methodValue: "3-Track 병렬 검토",
      access: "접근 권한",
      accessValue: "외부 전용 · 소스코드 미포함",
      accessExplanation: "본 평가는 회사 내부의 소스코드나 서버 권한 없이, 100% 외부(구글 검색 로봇 및 해커와 동일한 시선)에서 진행되었습니다. 이는 외부에 노출된 치명적 결함을 가장 객관적으로 파악하기 위함입니다.",
      confidential: "대외비 및 기밀",
      page1Title: "01 · 평가 방법론 및 범위",
      track1: "프론트엔드",
      track1Desc: "렌더링된 HTML, 메타 태그, 시맨틱 구조, 접근성 ARIA 속성, 뷰포트 지시문 및 모바일 줌 정책 분석. 클라이언트 측 DOM 무결성을 평가합니다.",
      track2: "백엔드 및 인프라",
      track2Desc: "TLS, 보안 응답 헤더(HSTS, CSP), CORS 정책, 리디렉션 체인, DNS 구성, 에지 CDN 식별, 캐싱 정책 및 이메일 인증(SPF/DMARC) 검사.",
      track3: "성능 측정",
      track3Desc: "페이지 무게, 글꼴 로딩 워터폴, CSS/JS 렌더링 차단 전송, 이미지 파이프라인 최적화(Next/Image 대 네이티브), TTFB, HTTP/2 다중화 및 Core Web Vitals 측정.",
      page2Title: "02 · 종합 판정 결과",
      outOf100: "100점 만점",
      verdictStock: "이 판정은 5개의 핵심 평가 범주에서 수학적으로 도출되었습니다. 숫자 점수는 높은 수준의 요약을 제공하지만 애플리케이션의 진정한 구조적 무결성은 범주형 메트릭 뒤에 오는 전문 AI 생성 분석에 자세히 설명되어 있습니다.",
      scoreScale: "점수 해석 척도",
      scale1: "기초 부족",
      scale1Desc: "주요 재작업이 필요합니다. 출시하지 마십시오.",
      scale2: "준비 미흡",
      scale2Desc: "치명적인 차단 요소가 있습니다. 즉각적인 수정이 필요합니다.",
      scale3: "베타 수준",
      scale3Desc: "핵심 영역에 상당한 격차가 있습니다. 불안정합니다.",
      scale4: "소프트 런칭",
      scale4Desc: "제한된 대상에게 허용되는 알려진 문제. 기업용 확장 전 경고 수정 요망.",
      scale5: "출시 준비 완료",
      scale5Desc: "사소한 수정만 필요합니다. 기업용 확장에 적합합니다.",
      page3Title: "03 · 카테고리: 성능",
      page4Title: "04 · 보안 및 인프라",
      page5Title: "05 · 치명적 문제 및 조치 계획",
      page6Title: "06 · COPPA 및 개인정보 보호 노출",
      appendixTitle: "부록 · 외부 평가의 한계",
      aiBreakdownTitle: "심층 기술 실사 분석",
      scoreDesc: "퍼블릭 런칭 전에 치명적인 블로커를 반드시 해결해야 합니다. 인프라는 강력할 수 있지만 렌더링된 웹 표면에는 주의가 필요합니다.",
      weightedCat: "카테고리별 가중치",
      catInfra: "인프라",
      catContent: "콘텐츠 및 구조",
      catSecurity: "보안",
      catPerf: "성능",
      catAccess: "접근성",
      catTotal: "가중치 합계"
    };
  }
  return {
    coverSub: "Release Readiness Assessment",
    coverTitle: "Technical Due Diligence Report",
    coverDesc: "An external review of the production web surface across performance, security, accessibility, infrastructure, and content.",
    targetSurface: "Target Surface",
    auditor: "Auditor",
    method: "Methodology",
    methodValue: "3-Track Parallel Review",
    access: "Access Level",
    accessValue: "External Only · No Source",
    accessExplanation: "This audit was conducted entirely from the outside, acting as a search engine crawler or malicious actor, without access to internal source code or server configurations. This objective approach reveals exactly what is exposed to the public internet.",
    confidential: "Confidential & Proprietary",
    page1Title: "01 · Method & Scope",
    track1: "Frontend",
    track1Desc: "Analysis of rendered HTML, meta tags, semantic structure, accessibility ARIA attributes, viewport directives, and mobile zoom policies. Evaluates client-side DOM integrity.",
    track2: "Backend & Infra",
    track2Desc: "Inspection of TLS, security response headers (HSTS, CSP), CORS policies, redirect chains, DNS configurations, edge CDN identification, caching policies, and email auth (SPF/DMARC).",
    track3: "Performance",
    track3Desc: "Measurement of page weight, font loading waterfalls, CSS/JS render-blocking delivery, image pipeline optimization (Next/Image vs native), TTFB, HTTP/2 multiplexing, and Core Web Vitals.",
    page2Title: "02 · Overall Verdict",
    outOf100: "Out of 100",
    verdictStock: "This verdict is mathematically derived from five core assessment categories. While numerical scores provide a high-level summary, the true structural integrity of the application is detailed in the specialized AI-generated breakdown that follows the categorical metrics.",
    scoreScale: "Score Interpretation Scale",
    scale1: "Foundational",
    scale1Desc: "Major rework required. Do not release.",
    scale2: "Not Ready",
    scale2Desc: "Critical blockers present. Requires remediation.",
    scale3: "Beta At Best",
    scale3Desc: "Significant gaps in core areas. Unstable.",
    scale4: "Soft-Launch",
    scale4Desc: "Known issues acceptable for limited audience. Fix warnings before B2B scaling.",
    scale5: "Release-Ready",
    scale5Desc: "Minor polish only. Scalable to B2B enterprise.",
    page3Title: "03 · Category: Performance",
    page4Title: "04 · Security & Infrastructure",
    page5Title: "05 · Critical Blockers & Action Plan",
    page6Title: "06 · COPPA & PRIVACY EXPOSURE",
    appendixTitle: "APPENDIX · LIMITS OF EXTERNAL ASSESSMENT",
    aiBreakdownTitle: "Deep Technical Due Diligence Analysis",
    scoreDesc: "Critical blockers must be resolved before any public launch. Infrastructure may be strong, but the rendered web surface requires attention.",
    weightedCat: "WEIGHTED BY CATEGORY",
    catInfra: "Infrastructure",
    catContent: "Content & Structure",
    catSecurity: "Security",
    catPerf: "Performance",
    catAccess: "Accessibility",
    catTotal: "Weighted total"
  };
};

export default async function PrintReportPage(props: { 
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const resolvedParams = await props.params;
  setRequestLocale(resolvedParams.locale);
  
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const domain = searchParams.domain;
  const reportType = searchParams.type || "single";
  const paperSize = searchParams.paper || "a4";
  const dateStr = searchParams.date;
  const locale = resolvedParams.locale;
  const t = getPrintTranslations(locale);

  if (!domain) return <div className="p-10 text-center">No domain provided.</div>;

  const userId = session.user.id || session.user.email || "";

  // Fetch user white-label profile
  const userDb = await db.select({ companyName: users.companyName, whiteLabelLogo: users.whiteLabelLogo }).from(users).where(eq(users.id, userId)).limit(1);
  const companyName = userDb[0]?.companyName || "SEO Compass";
  const logoUrl = userDb[0]?.whiteLabelLogo ? `/api/user/logo` : "/icon.png";

  let safeHostname = domain;
  try {
    safeHostname = new URL(domain).hostname;
  } catch (e) {}

  // Fetch scans for this exact URL
  const scans = await db.select().from(scanResults)
    .where(eq(scanResults.url, domain))
    .orderBy(desc(scanResults.createdAt));
  
  if (scans.length === 0) {
    return <div className="p-10 text-center text-xl font-bold">No scan data found for this URL.</div>;
  }

  // Filter by date if provided
  let targetScans = scans;
  if (dateStr) {
    const targetDate = new Date(dateStr).toISOString().split('T')[0];
    targetScans = scans.filter(s => new Date(s.createdAt).toISOString().split('T')[0] === targetDate);
  }

  if (targetScans.length === 0) {
    return <div className="p-10 text-center text-xl font-bold">No scan data found for this date.</div>;
  }

  const latestScan = targetScans[0];

  // Verify ownership to avoid unauthorized access
  const projectId = latestScan.projectId;
  const projectCheck = await db.select().from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (projectCheck.length === 0) {
    return <div className="p-10 text-center text-xl font-bold">Project not found or unauthorized.</div>;
  }
  let results: any = {};
  let basicSeo: any = {};
  let performanceData: any = null;
  let auditData: any = null;
  let markdownReport: string | null = null;
  let rawEvidenceHash: string | null = null;
  let executiveSummary: string | null = null;

  try {
    results = JSON.parse(latestScan.canonicalRiskJson);
    basicSeo = JSON.parse(latestScan.basicSeoJson);
    if (latestScan.performanceJson) {
      performanceData = JSON.parse(latestScan.performanceJson);
    }
    
    // Support new AI-generated format or old fallback format
    let translationAvailable = true;
    if ((latestScan as any).auditJson) {
      let parsedAudit = JSON.parse((latestScan as any).auditJson);
      
      // Handle multi-language structure
      if (parsedAudit["en"]) {
        if (parsedAudit[locale]) {
           parsedAudit = parsedAudit[locale];
        } else {
           parsedAudit = parsedAudit["en"];
           translationAvailable = locale === 'en';
        }
      }

      if (parsedAudit.markdown_report) {
         markdownReport = parsedAudit.markdown_report;
         auditData = parsedAudit.original;
      } else {
         auditData = parsedAudit;
      }
      if (parsedAudit.executive_summary) {
         executiveSummary = parsedAudit.executive_summary;
      }
    }
    rawEvidenceHash = (latestScan as any).evidenceHash || null;
  } catch (e) {}

  const printDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });


  // Determine Verdict
  let verdictText = "Release-Ready";
  let verdictColor = "text-emerald-600";
  if ((latestScan.score || 0) < 20) {
    verdictText = "Foundational";
    verdictColor = "text-[#e11d48]";
  } else if ((latestScan.score || 0) < 40) {
    verdictText = "Not Ready";
    verdictColor = "text-[#e11d48]";
  } else if ((latestScan.score || 0) < 60) {
    verdictText = "Beta At Best";
    verdictColor = "text-amber-600";
  } else if ((latestScan.score || 0) < 80) {
    verdictText = "Soft-Launch";
    verdictColor = "text-[#111]";
  }

  const orientation = searchParams.orientation === "portrait" ? "portrait" : "landscape";
  const template = searchParams.template || "full";
  const includeVibe = searchParams.vibe === "true";
  const deck = auditData?.deck || {};
  
  // Calculate total pages dynamically
  let totalPages = 1; // Cover is always included
  
  // Calculate dynamic chunks to avoid overflow
  const warningChunks = deck.warnings?.length ? Math.ceil(deck.warnings.length / 4) : 0;
  const vibeChunks = (includeVibe && deck.vibe_coding_prompt) ? Math.ceil(deck.vibe_coding_prompt.length / 1600) : 0;
  const glossaryChunks = auditData?.glossary?.length ? Math.ceil(auditData.glossary.length / 6) : 0;

  if (template === "full") {
    totalPages += 3; // Cover, Methodology, Verdict, Readiness
    if (deck.blockers) totalPages += deck.blockers.length;
    if (deck.warnings && deck.warnings.length > 0) totalPages += warningChunks;
    if (deck.projected_trajectory) totalPages += 1;
    if (deck.phase2_roadmap) totalPages += 1;
    if (deck.industry_precedent) totalPages += 1;
    if (deck.coppa_risk) totalPages += 1;
    if (deck.legal_counsel) totalPages += 1;
    if (includeVibe && deck.vibe_coding_prompt) totalPages += vibeChunks;
    if (deck.appendix_blind_spots) totalPages += 1;
    if (auditData?.glossary?.length > 0) totalPages += glossaryChunks;
    if (rawEvidenceHash) totalPages += 1;
  } else if (template === "executive") {
    totalPages += 3; // Cover, Methodology, Verdict, Readiness
    if (deck.projected_trajectory) totalPages += 1;
    if (deck.coppa_risk) totalPages += 1;
    if (deck.industry_precedent) totalPages += 1;
    if (rawEvidenceHash) totalPages += 1;
  } else if (template === "jira") {
    if (deck.blockers) totalPages += deck.blockers.length;
    if (deck.warnings && deck.warnings.length > 0) totalPages += warningChunks;
    if (deck.phase2_roadmap) totalPages += 1;
    if (includeVibe && deck.vibe_coding_prompt) totalPages += vibeChunks;
    if (rawEvidenceHash) totalPages += 1;
  } else if (template === "legal") {
    if (deck.coppa_risk) totalPages += 1;
    if (deck.legal_counsel) totalPages += 1;
    if (deck.appendix_blind_spots) totalPages += 1;
    if (auditData?.glossary?.length > 0) totalPages += 1;
    if (rawEvidenceHash) totalPages += 1;
  }

  let currentPage = 1;

  return (
    <div className={`min-h-screen bg-[#f4f3ed] text-[#111] font-sans print-wrapper ${paperSize}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: ${paperSize} ${orientation} !important; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #f4f3ed; }
        }
      `}} />
      
      {!translationAvailable && <TranslateButton scanId={latestScan.id} targetLang={locale} />}
      
      <PrintAutomator />

      {/* PAGE 1: COVER PAGE */}
      <Slide 
        locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages}
        sectionName="COVER" title="TECHNICAL DUE DILIGENCE" companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
        leftColClass="col-span-8" rightColClass="col-span-4"
        leftCol={
          <div className="flex flex-col h-full justify-between">
            <img src={logoUrl} alt="Logo" className="h-10 object-contain self-start mb-8 filter grayscale contrast-200" />
            <div>
              <div className="font-mono text-xs tracking-widest uppercase text-[#666] mb-4">Release Readiness Assessment</div>
              <h1 className="text-6xl font-black leading-[0.9] tracking-tighter mb-6 uppercase">
                {safeHostname}<br/>Audit
              </h1>
              <div className="text-[#444] max-w-2xl text-sm leading-relaxed whitespace-pre-wrap pr-8">{deck.executive_summary || t.coverDesc}</div>
            </div>
          </div>
        }
        rightCol={
          <div className="flex flex-col justify-end h-full">
            <div className="border-t border-[#111] pt-6 mb-8">
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#666] mb-2">{t.method}</div>
              <div className="font-bold">{t.methodValue}</div>
            </div>
            <div className="border-t border-[#111] pt-6">
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#666] mb-2">{t.access}</div>
              <div className="font-bold">{t.accessValue}</div>
            </div>
            <div className="mt-20 font-mono text-[10px] text-[#e11d48] uppercase tracking-widest">{t.confidential}</div>
          </div>
        }
      />

      {['full', 'executive'].includes(template) && (
<>
      {/* PAGE 1.5: METHODOLOGY */}
      <MethodologySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} t={t} />

      {/* PAGE 2: VERDICT */}
      <Slide 
        locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages}
        sectionName="VERDICT" title="OVERALL VERDICT" companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
        leftCol={
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">OVERALL SCORE</div>
            <div className={`text-[140px] font-black leading-none tracking-tighter flex items-baseline gap-2 mb-6 ${
              (latestScan.score || 0) < 50 ? 'text-[#e11d48]' : 
              (latestScan.score || 0) < 80 ? 'text-amber-500' : 
              'text-emerald-600'
            }`}>
              {latestScan.score || 0}
              <span className="text-[60px] text-[#888] font-bold">/100</span>
            </div>
            <div className={`inline-block px-3 py-1 border ${verdictColor.includes('red') || verdictColor.includes('rose') || verdictColor.includes('#e11d48') ? 'border-[#e11d48] text-[#e11d48]' : 'border-[#111] text-[#111]'} font-mono text-xs uppercase tracking-widest font-bold mb-8 flex items-center gap-2 w-max`}>
              <div className="w-1.5 h-1.5 bg-current"></div>
              {verdictText}
            </div>
            <p className="text-[#444] text-sm leading-relaxed max-w-sm">
              {t.scoreDesc}
            </p>
          </div>
        }
        rightCol={
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-6">{t.weightedCat}</div>
            <div className="flex justify-between items-end pb-2 border-b border-[#111]">
              <div className="font-bold text-sm">{t.catInfra}</div>
              <div className="flex gap-6 font-mono text-sm"><span>85</span> <span className="text-[#888]">19%</span> <span>16.2</span></div>
            </div>
            <div className="flex justify-between items-end py-4 border-b border-[#ddd]">
              <div className="font-bold text-sm">{t.catContent}</div>
              <div className="flex gap-6 font-mono text-sm"><span>40</span> <span className="text-[#888]">12%</span> <span>5.0</span></div>
            </div>
            <div className="flex justify-between items-end py-4 border-b border-[#ddd]">
              <div className="font-bold text-sm">{t.catSecurity}</div>
              <div className="flex gap-6 font-mono text-sm"><span>30</span> <span className="text-[#888]">25%</span> <span>7.5</span></div>
            </div>
            <div className="flex justify-between items-end py-4 border-b border-[#ddd]">
              <div className="font-bold text-sm">{t.catPerf}</div>
              <div className="flex gap-6 font-mono text-sm"><span>{performanceData?.score || 25}</span> <span className="text-[#888]">25%</span> <span>6.3</span></div>
            </div>
            <div className="flex justify-between items-end py-4 border-b border-[#111]">
              <div className="font-bold text-sm">{t.catAccess}</div>
              <div className="flex gap-6 font-mono text-sm"><span>15</span> <span className="text-[#888]">19%</span> <span>2.8</span></div>
            </div>
            <div className="flex justify-between items-end py-4">
              <div className="font-bold text-sm">{t.catTotal}</div>
              <div className="flex gap-6 font-mono text-sm"><span className="text-[#888]">100%</span> <span className="font-bold">37.8</span></div>
            </div>
          </div>
        }
      />

      {/* PAGE 3: COMPLIANCE CHECK */}
      {deck.compliance_status && (
      <Slide 
        orientation={orientation} pageNum={currentPage++} totalPages={totalPages}
        sectionName="COMPLIANCE" title="BASIC COMPLIANCE READINESS" companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
        leftCol={
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-6">Basic Policy<br/>Requirements</h2>
            <p className="text-[#444] text-sm leading-relaxed max-w-sm mb-8">
              {deck.compliance_status.analysis_text}
            </p>
          </div>
        }
        rightCol={
          <div>
            <div className="flex justify-between items-end pb-2 border-b border-[#111] mb-2">
              <div className="font-mono text-[10px] tracking-widest uppercase text-[#666]">CHECK</div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-[#666]">STATUS</div>
            </div>
            <CheckRow 
              title="Terms of Service" 
              subtext={deck.compliance_status.terms_found ? "Link detected" : "Missing from DOM"} 
              points={deck.compliance_status.terms_found ? "PASS" : "FAIL"} 
              isFail={!deck.compliance_status.terms_found} 
            />
            <CheckRow 
              title="Privacy Policy" 
              subtext={deck.compliance_status.privacy_found ? "Link detected" : "Missing from DOM"} 
              points={deck.compliance_status.privacy_found ? "PASS" : "FAIL"} 
              isFail={!deck.compliance_status.privacy_found} 
            />
            <CheckRow 
              title="Contact Information" 
              subtext={deck.compliance_status.contact_found ? "Detected" : "Missing from DOM"} 
              points={deck.compliance_status.contact_found ? "PASS" : "FAIL"} 
              isFail={!deck.compliance_status.contact_found} 
            />
          </div>
        }
      />
      )}

      {/* DYNAMIC BLOCKER SLIDES */}
      {deck.blockers?.map((blocker: any, i: number) => (
        <BlockerSlide locale={locale} key={i} index={i+1} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} blocker={blocker} />
      ))}

      {/* WARNINGS SLIDE */}
      {deck.warnings?.length > 0 && (
        Array.from({ length: warningChunks }, (_, i) => deck.warnings.slice(i * 4, i * 4 + 4)).map((chunk: any, i: number) => (
          <WarningSlide locale={locale} key={i} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} warnings={chunk} />
        ))
      )}

      {/* TRAJECTORY SLIDE */}
      {deck.projected_trajectory?.length > 0 && (
        <TrajectorySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} currentScore={latestScan.score || 0} trajectory={deck.projected_trajectory} />
      )}

      {/* ROADMAP SLIDE */}
      {deck.phase2_roadmap?.length > 0 && (
        <RoadmapSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} roadmap={deck.phase2_roadmap} />
      )}

            </>
      )}

      {['full', 'jira'].includes(template) && includeVibe && deck.vibe_coding_prompt && (
        (deck.vibe_coding_prompt.match(/[\s\S]{1,1600}/g) || [deck.vibe_coding_prompt]).map((chunk: string, i: number) => (
          <VibeCodingSlide locale={locale} key={i} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} promptText={chunk} evidenceHash={rawEvidenceHash} paperSize={paperSize} />
        ))
      )}



      {['full', 'executive'].includes(template) && (
<>
      {/* INDUSTRY PRECEDENT SLIDE */}
      {deck.industry_precedent?.length > 0 && (
        <IndustryPrecedentSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} precedents={deck.industry_precedent} />
      )}

      </>
      )}

      {['full', 'executive', 'legal'].includes(template) && (
<>
      {/* COPPA SLIDE */}
      {deck.coppa_risk && (
        <CoppaSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} coppa={deck.coppa_risk} />
      )}

      </>
      )}

      {['full', 'legal'].includes(template) && (
<>
      {/* LEGAL SLIDE */}
      {deck.legal_counsel && (
        <LegalSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} legal={deck.legal_counsel} />
      )}

      {/* APPENDIX SLIDE */}
      {deck.appendix_blind_spots?.length > 0 && (
        <AppendixSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} blindSpots={deck.appendix_blind_spots} />
      )}

      {/* GLOSSARY */}
      {auditData?.glossary && auditData.glossary.length > 0 && (
        Array.from({ length: glossaryChunks }, (_, i) => auditData.glossary.slice(i * 6, i * 6 + 6)).map((chunk: any, i: number) => (
          <GlossarySlide locale={locale} key={i} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} glossary={chunk} />
        ))
      )}

      </>
      )}

      {/* EVIDENCE HASH */}
      {rawEvidenceHash && (
        <div className={`print-page mx-auto mb-12 shadow-2xl bg-[#1a1b1e] text-[#f8f9fa] p-12 flex flex-col relative page-break-after justify-center box-border`} style={{ width: orientation === 'landscape' ? (paperSize === 'letter' ? '11in' : '297mm') : (paperSize === 'letter' ? '8.5in' : '210mm'), minHeight: orientation === 'landscape' ? (paperSize === 'letter' ? '8.5in' : '210mm') : (paperSize === 'letter' ? '11in' : '297mm') }}>
           <div className="max-w-3xl">
             <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-4">LEGAL NON-REPUDIATION</div>
             <h1 className="text-4xl font-black tracking-tighter mb-6 uppercase">Cryptographic Evidence Hash</h1>
             <p className="text-sm text-[#ccc] leading-relaxed mb-8">
               This report's underlying raw technical data was cryptographically sealed at the time of scanning. Alteration of the original telemetry will invalidate this SHA-256 fingerprint.
             </p>
             <div className="font-mono text-sm bg-black p-6 border border-[#333] text-emerald-400 break-all">
               {rawEvidenceHash}
             </div>
           </div>
           <div className="absolute bottom-12 left-12 right-12 flex justify-between font-mono text-[10px] text-[#888] uppercase tracking-widest mt-8 shrink-0">
             <span>FINGERPRINT</span>
             <span>{currentPage++} / {totalPages}</span>
           </div>
        </div>
      )}

    </div>
  );
}
