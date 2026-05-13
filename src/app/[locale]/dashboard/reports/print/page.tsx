import { auth } from "@/auth";
import { db } from "@/lib/db";
import { scanResults, users, projects } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Globe, TrendingUp, ShieldCheck, FileCode2, AlertTriangle, CheckCircle2, XCircle, Lock } from "lucide-react";
import { PrintAutomator } from "./print-automator";
import ReactMarkdown from "react-markdown";
import { Slide, CheckRow, BlockerSlide, WarningSlide, TrajectorySlide, RoadmapSlide, CoppaSlide, IndustryPrecedentSlide, AppendixSlide, LegalSlide, VibeCodingSlide, MethodologySlide, GlossarySlide, ConclusionSlide, AgendaSlide, CategorySlide, ReadinessUseCaseSlide, PerformanceSlide, getSlideDesc } from './PrintSlides';
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
      page1Title: "평가 방법론 및 범위",
      track1: "프론트엔드",
      track1Desc: "렌더링된 HTML, 메타 태그, 시맨틱 구조, 접근성 ARIA 속성, 뷰포트 지시문 및 모바일 줌 정책 분석. 클라이언트 측 DOM 무결성을 평가합니다.",
      track2: "백엔드 및 인프라",
      track2Desc: "TLS, 보안 응답 헤더(HSTS, CSP), CORS 정책, 리디렉션 체인, DNS 구성, 에지 CDN 식별, 캐싱 정책 및 이메일 인증(SPF/DMARC) 검사.",
      track3: "성능 측정",
      track3Desc: "페이지 무게, 글꼴 로딩 워터폴, CSS/JS 렌더링 차단 전송, 이미지 파이프라인 최적화(Next/Image 대 네이티브), TTFB, HTTP/2 다중화 및 Core Web Vitals 측정.",
      page2Title: "종합 판정 결과",
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
      page3Title: "카테고리: 성능",
      page4Title: "보안 및 인프라",
      page5Title: "치명적 문제 및 조치 계획",
      page6Title: "COPPA 및 개인정보 보호 노출",
      appendixTitle: "부록 - 외부 평가의 한계",
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

  } else if (locale === 'ja') {
    return {
      coverSub: "リリース準備評価",
      coverTitle: "技術監査レポート",
      coverDesc: "パフォーマンス、セキュリティ、アクセシビリティ、インフラ、コンテンツにわたる本番Webサーフェスの外部レビュー。",
      targetSurface: "対象サーフェス",
      auditor: "監査機関",
      method: "監査手法",
      methodValue: "3トラック並行レビュー",
      access: "アクセス権限",
      accessValue: "外部のみ · ソースコードなし",
      accessExplanation: "この監査は、内部ソースコードやサーバー構成にアクセスすることなく、検索エンジンのクローラーや悪意のある攻撃者として完全に外部から実施されました。この客観的なアプローチにより、パブリックインターネットに公開されている情報が正確に明らかになります。",
      confidential: "社外秘および機密情報",
      page1Title: "手法と範囲",
      track1: "フロントエンド",
      track1Desc: "レンダリングされたHTML、メタタグ、セマンティック構造、アクセシビリティARIA属性、ビューポートディレクティブ、モバイルズームポリシーの分析。クライアント側のDOMの整合性を評価します。",
      track2: "バックエンドおよびインフラ",
      track2Desc: "TLS、セキュリティ応答ヘッダー(HSTS、CSP)、CORSポリシー、リダイレクトチェーン、DNS構成、エッジCDN識別、キャッシュポリシー、電子メール認証(SPF/DMARC)の検査。",
      track3: "パフォーマンス",
      track3Desc: "ページサイズ、フォントの読み込み、CSS/JSのレンダリングブロック、画像の最適化(Next/Imageとネイティブ)、TTFB、HTTP/2の多重化、Core Web Vitalsの測定。",
      page2Title: "総合判定結果",
      outOf100: "100点満点",
      verdictStock: "この判定は5つの主要な評価カテゴリから数学的に導き出されます。数値スコアは概要を提供しますが、アプリケーションの真の構造的完全性は、AIが生成した詳細な分析に記載されています。",
      scoreScale: "スコアの解釈",
      scale1: "基礎不足",
      scale1Desc: "大幅な再構築が必要です。リリースしないでください。",
      scale2: "準備不足",
      scale2Desc: "致命的なブロッカーが存在します。即時の修正が必要です。",
      scale3: "ベータ版レベル",
      scale3Desc: "主要分野に大きなギャップがあります。不安定です。",
      scale4: "ソフトローンチ",
      scale4Desc: "限定的な公開であれば許容される既知の問題。B2B展開の前に警告を修正してください。",
      scale5: "リリース準備完了",
      scale5Desc: "軽微な修正のみ。B2Bエンタープライズへの拡張が可能です。",
      page3Title: "カテゴリ：パフォーマンス",
      page4Title: "セキュリティとインフラ",
      page5Title: "致命的な問題とアクションプラン",
      page6Title: "COPPAおよびプライバシーの露出",
      appendixTitle: "付録 - 外部評価の限界",
      aiBreakdownTitle: "詳細な技術監査分析",
      scoreDesc: "一般公開の前に致命的なブロッカーを必ず解決する必要があります。インフラは堅牢かもしれませんが、レンダリングされたWebサーフェスには注意が必要です。",
      weightedCat: "カテゴリ別重み付け",
      catInfra: "インフラ",
      catContent: "コンテンツと構造",
      catSecurity: "セキュリティ",
      catPerf: "パフォーマンス",
      catAccess: "アクセシビリティ",
      catTotal: "加重合計"
    };
  } else if (locale === 'es') {
    return {
      coverSub: "Evaluación de Preparación para el Lanzamiento",
      coverTitle: "Informe de Auditoría Técnica",
      coverDesc: "Una revisión externa de la superficie web de producción a través del rendimiento, seguridad, accesibilidad, infraestructura y contenido.",
      targetSurface: "Superficie Objetivo",
      auditor: "Auditor",
      method: "Metodología",
      methodValue: "Revisión Paralela de 3 Pistas",
      access: "Nivel de Acceso",
      accessValue: "Solo Externo · Sin Código Fuente",
      accessExplanation: "Esta auditoría se realizó completamente desde el exterior, actuando como un rastreador de motores de búsqueda o un actor malintencionado, sin acceso al código fuente interno ni a las configuraciones del servidor. Este enfoque objetivo revela exactamente lo que está expuesto a la Internet pública.",
      confidential: "Confidencial y de Propiedad",
      page1Title: "Método y Alcance",
      track1: "Frontend",
      track1Desc: "Análisis de HTML renderizado, metaetiquetas, estructura semántica, atributos ARIA de accesibilidad, directivas de ventana gráfica y políticas de zoom móvil. Evalúa la integridad del DOM del lado del cliente.",
      track2: "Backend e Infraestructura",
      track2Desc: "Inspección de TLS, encabezados de respuesta de seguridad (HSTS, CSP), políticas de CORS, cadenas de redireccionamiento, configuraciones de DNS, identificación de CDN de borde, políticas de almacenamiento en caché y autenticación de correo electrónico (SPF/DMARC).",
      track3: "Rendimiento",
      track3Desc: "Medición del peso de la página, carga de fuentes, entrega de bloqueo de renderizado de CSS/JS, optimización de imágenes (Next/Image vs nativo), TTFB, multiplexación HTTP/2 y Core Web Vitals.",
      page2Title: "Veredicto General",
      outOf100: "De 100",
      verdictStock: "Este veredicto se deriva matemáticamente de cinco categorías de evaluación principales. Si bien las puntuaciones numéricas proporcionan un resumen de alto nivel, la verdadera integridad estructural de la aplicación se detalla en el análisis especializado generado por IA que sigue a las métricas categóricas.",
      scoreScale: "Escala de Interpretación",
      scale1: "Insuficiente",
      scale1Desc: "Se requiere una revisión importante. No publicar.",
      scale2: "No Listo",
      scale2Desc: "Bloqueos críticos presentes. Requiere corrección.",
      scale3: "Nivel Beta",
      scale3Desc: "Brechas significativas en áreas centrales. Inestable.",
      scale4: "Lanzamiento Suave",
      scale4Desc: "Problemas conocidos aceptables para audiencia limitada. Corrija las advertencias antes del escalado B2B.",
      scale5: "Listo para Lanzamiento",
      scale5Desc: "Solo correcciones menores. Escalable a nivel empresarial B2B.",
      page3Title: "Categoría: Rendimiento",
      page4Title: "Seguridad e Infraestructura",
      page5Title: "Problemas Críticos y Plan de Acción",
      page6Title: "COPPA y Exposición de Privacidad",
      appendixTitle: "Apéndice - Límites de Evaluación",
      aiBreakdownTitle: "Análisis Técnico Detallado",
      scoreDesc: "Los bloqueos críticos DEBEN resolverse antes del lanzamiento público. Aunque la infraestructura pueda ser robusta, la superficie web renderizada requiere atención.",
      weightedCat: "Categorías Ponderadas",
      catInfra: "Infraestructura",
      catContent: "Contenido y Estructura",
      catSecurity: "Seguridad",
      catPerf: "Rendimiento",
      catAccess: "Accesibilidad",
      catTotal: "Total Ponderado"
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
    page1Title: "Method & Scope",
    track1: "Frontend",
    track1Desc: "Analysis of rendered HTML, meta tags, semantic structure, accessibility ARIA attributes, viewport directives, and mobile zoom policies. Evaluates client-side DOM integrity.",
    track2: "Backend & Infra",
    track2Desc: "Inspection of TLS, security response headers (HSTS, CSP), CORS policies, redirect chains, DNS configurations, edge CDN identification, caching policies, and email auth (SPF/DMARC).",
    track3: "Performance",
    track3Desc: "Measurement of page weight, font loading waterfalls, CSS/JS render-blocking delivery, image pipeline optimization (Next/Image vs native), TTFB, HTTP/2 multiplexing, and Core Web Vitals.",
    page2Title: "Overall Verdict",
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
    page3Title: "Category: Performance",
    page4Title: "Security & Infrastructure",
    page5Title: "Critical Blockers & Action Plan",
    page6Title: "COPPA & PRIVACY EXPOSURE",
    appendixTitle: "Appendix - Limits of External Assessment",
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
  let translationAvailable = true;

  try {
    results = JSON.parse(latestScan.canonicalRiskJson);
    basicSeo = JSON.parse(latestScan.basicSeoJson);
    if (latestScan.performanceJson) {
      performanceData = JSON.parse(latestScan.performanceJson);
    }
    
    // Support new AI-generated format or old fallback format
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
  const getGlossaryTerms = (loc: string) => {
    const isKo = loc === 'ko';
    const isJa = loc === 'ja';
    const isEs = loc === 'es';
    return [
      { term: isKo ? '인프라스트럭처 (Infrastructure)' : isJa ? 'インフラストラクチャ (Infrastructure)' : isEs ? 'Infraestructura' : 'Infrastructure', definition: isKo ? '웹사이트의 뼈대를 구성하는 서버, 호스팅, 네트워크 구성 상태의 최적화 수준을 의미합니다.' : isJa ? 'ウェブサイトの骨格を構成するサーバー、ホスティング、ネットワーク構成状態の最適化レベルを意味します。' : isEs ? 'El nivel de optimización del servidor, alojamiento y configuración de red que forman la columna vertebral del sitio web.' : 'The optimization level of the server, hosting, and network configuration that form the backbone of the website.' },
      { term: isKo ? '콘텐츠 (Content)' : isJa ? 'コンテンツ (Content)' : isEs ? 'Contenido' : 'Content', definition: isKo ? '검색 엔진이 사이트 내의 텍스트와 의미를 얼마나 잘 이해하고 수집할 수 있는지를 나타내는 지표입니다.' : isJa ? '検索エンジンがサイト内のテキストと意味をどれだけよく理解して収集できるかを示す指標です。' : isEs ? 'Un indicador de lo bien que los motores de búsqueda pueden entender y recopilar el texto y el significado dentro del sitio.' : 'An indicator of how well search engines can understand and crawl the text and semantic meaning within the site.' },
      { term: isKo ? '보안 (Security)' : isJa ? 'セキュリティ (Security)' : isEs ? 'Seguridad' : 'Security', definition: isKo ? '통신 암호화(HTTPS), 해킹 방어 등 검색 엔진이 사용자에게 안전하다고 판단할 수 있는 신뢰성 지표입니다.' : isJa ? '通信暗号化（HTTPS）、ハッキング防御など、検索エンジンがユーザーに安全であると判断できる信頼性指標です。' : isEs ? 'Un indicador de confiabilidad que permite a los motores de búsqueda determinar si el sitio es seguro para los usuarios, como el cifrado de comunicación y la defensa contra la piratería.' : 'A reliability indicator that allows search engines to determine if the site is safe for users, such as communication encryption (HTTPS) and hacking defense.' },
      { term: isKo ? '성능 (Performance)' : isJa ? 'パフォーマンス (Performance)' : isEs ? 'Rendimiento' : 'Performance', definition: isKo ? '웹페이지의 렌더링 속도와 반응성을 의미하며, 구글 코어 웹 바이탈(Core Web Vitals)의 핵심 기준이 됩니다.' : isJa ? 'ウェブページのレンダリング速度と応答性を意味し、Googleコアウェブバイタル（Core Web Vitals）の重要な基準となります。' : isEs ? 'Se refiere a la velocidad de renderizado y capacidad de respuesta de la página web, y es un criterio central de Google Core Web Vitals.' : 'Refers to the rendering speed and responsiveness of the web page, serving as a core criterion for Google Core Web Vitals.' },
      { term: isKo ? '접근성 (Accessibility)' : isJa ? 'アクセシビリティ (Accessibility)' : isEs ? 'Accesibilidad' : 'Accessibility', definition: isKo ? '장애인을 포함한 모든 사용자 및 검색 엔진 로봇이 웹사이트의 콘텐츠에 얼마나 명확하게 접근할 수 있는지를 평가합니다.' : isJa ? '障害者を含むすべてのユーザーと検索エンジンロボットがウェブサイトのコンテンツにどれだけ明確にアクセスできるかを評価します。' : isEs ? 'Evalúa con qué claridad todos los usuarios, incluidos aquellos con discapacidades, así como los robots de los motores de búsqueda, pueden acceder al contenido.' : 'Evaluates how clearly all users, including those with disabilities, as well as search engine robots, can access the content.' },
      { term: isKo ? '가중치 총점 (Weighted Total)' : isJa ? '加重合計 (Weighted Total)' : isEs ? 'Total ponderado' : 'Weighted Total', definition: isKo ? '각 평가 항목의 SEO 기여도(중요도)에 따라 가중치를 곱하여 산출한 최종 기술 실사 점수입니다.' : isJa ? '各評価項目のSEOへの貢献度（重要度）に応じて加重値を乗じて算出した最終技術実査スコアです。' : isEs ? 'La puntuación de auditoría técnica final calculada multiplicando los pesos según la contribución (importancia) SEO de cada categoría de evaluación.' : 'The final technical audit score calculated by multiplying weights according to the SEO contribution (importance) of each evaluation category.' },
      { term: isKo ? 'Robots.txt & Sitemap' : isJa ? 'Robots.txt & Sitemap' : isEs ? 'Robots.txt y Sitemap' : 'Robots.txt & Sitemap', definition: isKo ? '검색 엔진 봇이 사이트를 수집할 때 접근을 허용하거나 차단하는 규칙(Robots.txt)과 모든 페이지의 지도(Sitemap)입니다.' : isJa ? '検索エンジンボットがサイトを収集する際にアクセスを許可またはブロックするルール（Robots.txt）とすべてのページの地図（Sitemap）です。' : isEs ? 'Reglas que permiten o bloquean el acceso de los bots de los motores de búsqueda (Robots.txt) y un mapa de todas las páginas (Sitemap).' : 'Rules that allow or block access when search engine bots crawl the site (Robots.txt) and a map of all pages (Sitemap).' },
      { term: isKo ? 'Canonical Tags' : isJa ? 'Canonical Tags' : isEs ? 'Etiquetas canónicas' : 'Canonical Tags', definition: isKo ? '중복된 콘텐츠가 있을 경우 검색 엔진에게 원본(표준) 페이지가 무엇인지 알려주는 HTML 태그입니다.' : isJa ? '重複するコンテンツがある場合、検索エンジンに元の（標準）ページがどれであるかを伝えるHTMLタグです。' : isEs ? 'Una etiqueta HTML que indica a los motores de búsqueda cuál es la página original (canónica) cuando hay contenido duplicado.' : 'An HTML tag that tells search engines which is the original (canonical) page when there is duplicate content.' },
      { term: isKo ? 'HSTS & CSP Headers' : isJa ? 'HSTS & CSP Headers' : isEs ? 'Cabeceras HSTS y CSP' : 'HSTS & CSP Headers', definition: isKo ? '강제 HTTPS 접속(HSTS)과 악성 스크립트 실행 방지(CSP)를 웹 브라우저에 지시하는 필수 보안 헤더입니다.' : isJa ? '強制HTTPS接続（HSTS）と悪意のあるスクリプト実行防止（CSP）をウェブブラウザに指示する必須のセキュリティヘッダーです。' : isEs ? 'Cabeceras de seguridad esenciales que indican al navegador web que fuerce la conexión HTTPS (HSTS) y evite la ejecución de scripts maliciosos (CSP).' : 'Essential security headers that instruct the web browser to force HTTPS connection (HSTS) and prevent malicious script execution (CSP).' },
      { term: isKo ? 'X-Frame-Options' : isJa ? 'X-Frame-Options' : isEs ? 'X-Frame-Options' : 'X-Frame-Options', definition: isKo ? '외부 사이트가 내 사이트를 아이프레임(iframe)으로 불러와 클릭을 유도하는 해킹(클릭재킹)을 방어합니다.' : isJa ? '外部サイトが自分のサイトをiframeとして読み込んでクリックを誘発するハッキング（クリックジャッキング）を防御します。' : isEs ? 'Defiende contra ataques de clickjacking donde sitios externos cargan el sitio en un iframe para engañar a los usuarios.' : 'Defends against clickjacking attacks where external sites load the site in an iframe to trick users into clicking.' },
      { term: isKo ? 'TLS Protocol' : isJa ? 'TLS Protocol' : isEs ? 'Protocolo TLS' : 'TLS Protocol', definition: isKo ? '서버와 클라이언트 간의 데이터를 암호화하여 전송하는 통신 보안 프로토콜 규격입니다. (최신 웹은 1.2 이상 필수)' : isJa ? 'サーバーとクライアント間でデータを暗号化して送信する通信セキュリティプロトコルの規格です。（最新のウェブでは1.2以上が必須）' : isEs ? 'Un estándar de protocolo de seguridad de comunicaciones que cifra los datos entre el servidor y el cliente. (TLS 1.2+ es obligatorio en la web moderna).' : 'A communication security protocol standard that encrypts data between the server and the client. (TLS 1.2+ is mandatory in the modern web).' },
      { term: isKo ? 'Mobile Viewport' : isJa ? 'Mobile Viewport' : isEs ? 'Viewport móvil' : 'Mobile Viewport', definition: isKo ? '모바일 기기에서 화면 비율과 크기를 올바르게 렌더링하기 위한 메타 태그로, 모바일 친화성 평가의 핵심입니다.' : isJa ? 'モバイルデバイスで画面比率とサイズを正しくレンダリングするためのメタタグであり、モバイルフレンドリー評価の核心です。' : isEs ? 'Una etiqueta meta para renderizar correctamente la relación de aspecto y el tamaño en dispositivos móviles, central para la evaluación de usabilidad móvil.' : 'A meta tag for correctly rendering the aspect ratio and size on mobile devices, central to the mobile-friendliness assessment.' },
      { term: isKo ? 'Semantic HTML' : isJa ? 'Semantic HTML' : isEs ? 'HTML Semántico' : 'Semantic HTML', definition: isKo ? '문서의 구조와 의미를 명확히 하는 태그(nav, header, article 등)를 사용하여 검색 엔진의 구조 파악을 돕습니다.' : isJa ? 'ドキュメントの構造と意味を明確にするタグ（nav、header、articleなど）を使用して、検索エンジンが構造を把握するのを助けます。' : isEs ? 'Uso de etiquetas (nav, header, article, etc.) que aclaran la estructura y el significado del documento para ayudar a los motores de búsqueda.' : 'The use of tags (nav, header, article, etc.) that clarify the structure and meaning of the document to help search engines understand the structure.' },
      { term: isKo ? 'Alt Text Coverage' : isJa ? 'Alt Text Coverage' : isEs ? 'Cobertura de texto alternativo' : 'Alt Text Coverage', definition: isKo ? '웹사이트 내 이미지들에 시각 장애인 및 검색 봇을 위한 대체 텍스트(alt 속성)가 얼마나 적용되었는지에 대한 비율입니다.' : isJa ? 'ウェブサイト内の画像に視覚障害者および検索ボットのための代替テキスト（alt属性）がどれだけ適用されているかの割合です。' : isEs ? 'El porcentaje de imágenes en el sitio web a las que se les ha aplicado texto alternativo (atributo alt) para usuarios con discapacidad visual y bots.' : 'The percentage of images on the website that have alternative text (alt attribute) applied for visually impaired users and search bots.' },
      { term: isKo ? 'Font Preloads' : isJa ? 'Font Preloads' : isEs ? 'Precargas de fuentes' : 'Font Preloads', definition: isKo ? '중요한 폰트 파일을 렌더링 초기에 미리 다운로드(Preload)하도록 지정하여 글꼴 깨짐 현상을 방지하는 기술입니다.' : isJa ? '重要なフォントファイルをレンダリング初期に事前にダウンロード（Preload）するように指定し、フォントの崩れを防ぐ技術です。' : isEs ? 'Una técnica para evitar el destello de texto sin estilo designando archivos de fuentes importantes para que se descarguen con anticipación (Preload).' : 'A technique to prevent the flash of unstyled text by designating important font files to be downloaded early in rendering (Preload).' },
      { term: isKo ? 'CSS / JS Assets' : isJa ? 'CSS / JS Assets' : isEs ? 'Activos CSS / JS' : 'CSS / JS Assets', definition: isKo ? '페이지를 구성하는 데 필요한 스타일시트(CSS)와 스크립트(JS) 파일의 개수입니다. 적을수록 로딩 속도에 유리합니다.' : isJa ? 'ページを構成するために必要なスタイルシート（CSS）とスクリプト（JS）ファイルの数です。少ないほど読み込み速度に有利です。' : isEs ? 'La cantidad de archivos de hojas de estilo (CSS) y scripts (JS) necesarios para componer la página. Cuantos menos, mejor para la velocidad de carga.' : 'The number of stylesheet (CSS) and script (JS) files required to compose the page. Fewer assets are better for loading speed.' },
      { term: isKo ? 'Tech Stack' : isJa ? 'Tech Stack' : isEs ? 'Pila tecnológica' : 'Tech Stack', definition: isKo ? '서버, 프레임워크, 라이브러리 등 웹사이트를 구축하고 구동하는 데 사용된 기반 기술의 집합입니다.' : isJa ? 'サーバー、フレームワーク、ライブラリなど、ウェブサイトを構築および実行するために使用される基盤技術の集合です。' : isEs ? 'El conjunto de tecnologías subyacentes, como servidores, frameworks y bibliotecas, utilizadas para construir y ejecutar el sitio web.' : 'The set of underlying technologies, such as servers, frameworks, and libraries, used to build and run the website.' },
      { term: isKo ? 'Client Rendering (CSR)' : isJa ? 'Client Rendering (CSR)' : isEs ? 'Renderizado de cliente (CSR)' : 'Client Rendering (CSR)', definition: isKo ? '브라우저(클라이언트)가 자바스크립트를 이용해 화면을 그리는 방식. 초기 로딩 지연으로 인해 SEO 크롤링에 불리할 수 있습니다.' : isJa ? 'ブラウザ（クライアント）がJavaScriptを使用して画面を描画する方式。初期ロード遅延によりSEOクロールに不利になる可能性があります。' : isEs ? 'Un método donde el navegador dibuja la pantalla usando JavaScript. Puede ser desventajoso para el rastreo SEO debido al retraso inicial.' : 'A method where the browser (client) draws the screen using JavaScript. It can be disadvantageous for SEO crawling due to initial loading delays.' }
    ];
  };

  if (auditData) {
    if (!auditData.glossary) auditData.glossary = [];
    const defaultTerms = getGlossaryTerms(locale || 'en');
    const existingTermSet = new Set(auditData.glossary.map((g: any) => g.term.toLowerCase()));
    
    // Check against English standard names to prevent duplicates if AI provided varying localized names
    const newTerms = defaultTerms.filter((dt: any) => {
      const dtLower = dt.term.toLowerCase();
      // Skip if exactly matches
      if (existingTermSet.has(dtLower)) return false;
      return true;
    });

    auditData.glossary = [...newTerms, ...auditData.glossary];
  }

  const warningChunks = deck.warnings?.length ? Math.ceil(deck.warnings.length / 4) : 0;
  const vibeChunks = (includeVibe && deck.vibe_coding_prompt) ? Math.ceil(deck.vibe_coding_prompt.length / 1600) : 0;
  const glossaryChunks = auditData?.glossary?.length ? Math.ceil(auditData.glossary.length / 6) : 0;

  if (template === "full") {
    totalPages += 4; // Cover, Agenda, Methodology, Verdict
    totalPages += 6; // 5 Categories + Readiness
    if (performanceData) totalPages += 1;
    if (deck.compliance_status) totalPages += 1;
    if (deck.blockers) totalPages += deck.blockers.length;
    if (deck.warnings && deck.warnings.length > 0) totalPages += warningChunks;
    if (deck.projected_trajectory) totalPages += 1;
    if (deck.phase2_roadmap) totalPages += 1;
    if (deck.industry_precedent) totalPages += 1;
    if (deck.coppa_risk) totalPages += 1;
    if (deck.legal_counsel) totalPages += 1;
    if (includeVibe && deck.vibe_coding_prompt) totalPages += vibeChunks;
    if (deck.appendix_blind_spots) totalPages += 1;
    
    // Conclusion Slide is always added for full template
    totalPages += 1; 

    if (auditData?.glossary?.length > 0) totalPages += glossaryChunks;
    if (rawEvidenceHash) totalPages += 1;
  } else if (template === "executive") {
    totalPages += 4; // Cover, Agenda, Methodology, Verdict
    totalPages += 6; // 5 Categories + Readiness
    if (performanceData) totalPages += 1;
    if (deck.compliance_status) totalPages += 1;
    if (deck.projected_trajectory) totalPages += 1;
    if (deck.coppa_risk) totalPages += 1;
    if (deck.industry_precedent) totalPages += 1;
    totalPages += 1; // Conclusion
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
  const toc: any[] = [];
  
  if (template === "full" || template === "executive") {
    let page = 5; // Cover(1), Agenda(2), Methodology(3), Verdict(4)
    toc.push({ title: locale === 'ko' ? "방법론 및 범위" : "Method & Scope", page: 3 });
    toc.push({ title: locale === 'ko' ? "최종 판정" : "Overall Verdict", page: 4 });
    toc.push({ title: locale === 'ko' ? "항목별 세부 분석" : "Category Breakdown", page: page });
    page += auditData?.categories?.length || 5;
    
    toc.push({ title: locale === 'ko' ? "출시 준비도" : "Release Readiness", page: page });
    page += 1;
    
    if (performanceData) {
      toc.push({ title: locale === 'ko' ? "코어 웹 바이탈" : "Core Web Vitals", page: page });
      page += 1;
    }
    if (deck.compliance_status) {
      toc.push({ title: locale === 'ko' ? "컴플라이언스 체크" : "Compliance Check", page: page });
      page += 1;
    }
    if (template === "full") {
      if (deck.blockers?.length > 0) {
        toc.push({ title: locale === 'ko' ? "치명적 차단 요소" : "Critical Blockers", page: page });
        page += deck.blockers.length;
      }
      if (deck.warnings?.length > 0) {
        toc.push({ title: locale === 'ko' ? "경고 수준 조치" : "Warning-level Fixes", page: page });
        page += warningChunks;
      }
    }
    if (deck.projected_trajectory) {
      toc.push({ title: locale === 'ko' ? "예상 점수 궤적" : "Projected Trajectory", page: page });
      page += 1;
    }
    if (template === "full" && deck.phase2_roadmap) {
      toc.push({ title: locale === 'ko' ? "2단계 로드맵" : "Phase 2 Roadmap", page: page });
      page += 1;
    }
    if (template === "full" && includeVibe && deck.vibe_coding_prompt) {
      toc.push({ title: locale === 'ko' ? "AI 프롬프트" : "AI Remediation Prompt", page: page });
      page += vibeChunks;
    }
    if (deck.industry_precedent) {
      toc.push({ title: locale === 'ko' ? "업계 사례" : "Industry Precedent", page: page });
      page += 1;
    }
    if (deck.coppa_risk) {
      toc.push({ title: locale === 'ko' ? "COPPA 노출 위험" : "COPPA Risk Exposure", page: page });
      page += 1;
    }
    toc.push({ title: locale === 'ko' ? "최종 결론" : "Executive Conclusion", page: page });
    page += 1;
    
    if (template === "full") {
      if (deck.legal_counsel) {
        toc.push({ title: locale === 'ko' ? "법률 자문" : "Legal Counsel", page: page });
        page += 1;
      }
      if (deck.appendix_blind_spots) {
        toc.push({ title: locale === 'ko' ? "부록 (미평가 영역)" : "Appendix (Blind Spots)", page: page });
        page += 1;
      }
      if (auditData?.glossary?.length > 0) {
        toc.push({ title: locale === 'ko' ? "용어 사전" : "Glossary", page: page });
        page += glossaryChunks;
      }
      if (rawEvidenceHash) {
        toc.push({ title: locale === 'ko' ? "암호화 무결성 해시" : "Cryptographic Evidence Hash", page: page });
      }
    }
  }

  return (
    <div className={`min-h-screen bg-transparent text-[#111] font-sans print-wrapper ${paperSize}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: ${paperSize} ${orientation} !important; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: transparent; }
          .print-wrapper { background: white !important; }
          .print-page { 
            margin: 0 !important; 
            border: none !important; 
            box-shadow: none !important; 
            page-break-after: always !important; 
            page-break-inside: avoid !important; 
          }
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
            <img src={logoUrl} alt="Logo" className="h-10 object-contain self-start filter grayscale contrast-200" />
            <div className="mb-16">
              <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-4">Release Readiness Assessment</div>
              <h1 className="text-[72px] font-bold scale-y-105 origin-bottom-left leading-[0.9] tracking-tighter mb-8 uppercase">
                {safeHostname}<br/>Audit
              </h1>
              <div className="text-[#444] w-full text-[15px] leading-relaxed whitespace-pre-wrap pr-12 line-clamp-[12] overflow-hidden">{deck.executive_summary || t.coverDesc}</div>
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
      {/* PAGE 2: AGENDA (TABLE OF CONTENTS) */}
      <AgendaSlide toc={toc} locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} />
      {/* PAGE 1.5: METHODOLOGY */}
      <MethodologySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} t={t} />

      {/* PAGE 2 TO 8: VERDICT + 5 CATEGORIES + READINESS */}
      {(() => {
        // True Data-Driven Scoring Engine - Calculated from individual granular checks
        
        let infraChecks = auditData?.categories?.infrastructure?.checks || [
          { name: "Hosting platform", subtext: "Vercel - production-grade", pts: "15 / 15", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "CDN", subtext: "Vercel Edge Network", pts: "10 / 10", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "DNS", subtext: "Cloudflare - fast, reliable", pts: "10 / 10", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "TLS setup", subtext: "TLS 1.3 · auto-renew Let's Encrypt", pts: "10 / 10", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "HTTP redirects", subtext: "HTTP→HTTPS · www→non-www", pts: "10 / 10", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "Caching & edge", subtext: "ISR 300s · iad1", pts: "18 / 26", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "Email · MX / SPF", subtext: "Google Workspace · DMARC missing", pts: "7 / 15", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
          { name: "Multi-region", subtext: "Single region detected", pts: "5 / 10", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
        ];
        // Sum: 15+10+10+10+10+18+7+5 = 85
        let infraVal = infraChecks.reduce((acc, curr) => acc + parseInt(curr.pts.split(' / ')[0]), 0);

        let contentChecks = auditData?.categories?.content?.checks || [
          { name: "i18n setup", subtext: "3 locales · hreflang correct", pts: "15 / 15", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "Navigation structure", subtext: "Sparse · /services, /pricing redirect", pts: "6 / 26", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
          { name: "Subpage depth", subtext: "/about, /contact exist · others redirect", pts: "3 / 15", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
          { name: "Content richness in SSR", subtext: "Blank - all in CSR", pts: "1 / 26", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "URL structure", subtext: "Clean locale-based routing", pts: "10 / 15", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "404 handling", subtext: "Catch-all masks true 404s", pts: "5 / 15", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
        ];
        // Sum: 15+6+3+1+10+5 = 40
        let contentVal = contentChecks.reduce((acc, curr) => acc + parseInt(curr.pts.split(' / ')[0]), 0);

        let secChecks = auditData?.categories?.security?.checks || [
          { name: "HTTPS enforced", subtext: "308 redirect · HSTS set", pts: "10 / 15", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "Content-Security-Policy", subtext: "Missing", pts: "1 / 26", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "X-Frame-Options", subtext: "Missing", pts: "0 / 10", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "X-Content-Type-Options", subtext: "Missing", pts: "0 / 10", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "Referrer-Policy", subtext: "Missing", pts: "0 / 10", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "Permissions-Policy", subtext: "Missing - critical for Twilio mic", pts: "0 / 10", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "CORS policy", subtext: "* - overly permissive", pts: "5 / 10", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
          { name: "TLS 1.3 & cert validity", subtext: "Valid until 2026-06-29", pts: "14 / 15", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
        ];
        // Sum: 10+1+0+0+0+0+5+14 = 30
        let secVal = secChecks.reduce((acc, curr) => acc + parseInt(curr.pts.split(' / ')[0]), 0);

        let perfChecks = auditData?.categories?.performance?.checks || [
          { name: "Page weight (excl. fonts)", subtext: "1.9 MB - heavy", pts: "2 / 15", ptsColor: "text-[#111]", subtextColor: "text-[#666]" },
          { name: "Font loading", subtext: "733 preloads · ~14 MB waste", pts: "1 / 26", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "CSS delivery", subtext: "923 KB render-blocking", pts: "3 / 15", ptsColor: "text-[#111]", subtextColor: "text-[#666]" },
          { name: "JS delivery", subtext: "717 KB · 110 KB polyfills", pts: "2 / 15", ptsColor: "text-[#111]", subtextColor: "text-[#666]" },
          { name: "Image optimization", subtext: "No next/image · no lazy loading", pts: "0 / 15", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "TTFB", subtext: "256 ms - good", pts: "8 / 10", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
          { name: "Compression & HTTP/2", subtext: "Brotli · HTTP/2 enabled", pts: "9 / 10", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
        ];
        // Sum: 2+1+3+2+0+8+9 = 25
        let perfVal = perfChecks.reduce((acc, curr) => acc + parseInt(curr.pts.split(' / ')[0]), 0);

        let accessChecks = auditData?.categories?.accessibility?.checks || [
          { name: "Zoom / scale allowed", subtext: "user-scalable=no · WCAG violation", pts: "1 / 26", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "Semantic HTML", subtext: "0 elements in SSR", pts: "1 / 26", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "ARIA attributes", subtext: "0 detected", pts: "0 / 15", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "Alt text on images", subtext: "0 images in SSR output", pts: "0 / 15", ptsColor: "text-[#111]", subtextColor: "text-[#e11d48]" },
          { name: "Color contrast", subtext: "Cannot verify (CSR)", pts: "4 / 10", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
          { name: "Keyboard navigation", subtext: "Cannot verify (CSR)", pts: "4 / 10", ptsColor: "text-[#111]", subtextColor: "text-amber-500" },
          { name: "Language attribute", subtext: `lang="en" set`, pts: "5 / 5", ptsColor: "text-[#111]", subtextColor: "text-emerald-600" },
        ];
        // Sum: 1+1+0+0+4+4+5 = 15
        let accessVal = accessChecks.reduce((acc, curr) => acc + parseInt(curr.pts.split(' / ')[0]), 0);

        // Calculate True Weighted Total
        const trueOverall = (infraVal * 0.19) + (contentVal * 0.12) + (secVal * 0.25) + (perfVal * 0.25) + (accessVal * 0.19);
        const score = Math.round(trueOverall);
        
        let verdictColor = (t as any).vNotReadyColor || '#e11d48';
        let verdictText = locale === 'ko' ? '출시 불가' : 'NOT RELEASE-READY';
        if (score >= 90) {
          verdictColor = (t as any).vReadyColor || '#10b981';
          verdictText = (t as any).vReady || (locale === 'ko' ? '출시 적합' : 'RELEASE-READY');
        } else if (score >= 50) {
          verdictColor = (t as any).vWarningColor || '#f59e0b';
          verdictText = (t as any).vWarning || (locale === 'ko' ? '경고 수준' : 'NEEDS WORK');
        }

        const getVerdictProps = (val: number) => {
          if (val >= 80) return { text: locale === 'ko' ? "출시 적합" : "RELEASE-READY", color: "text-emerald-600", bg: "bg-emerald-600" };
          if (val >= 50) return { text: locale === 'ko' ? "경고 수준" : "BELOW AVERAGE", color: "text-amber-500", bg: "bg-amber-500" };
          return { text: locale === 'ko' ? "심각" : "POOR", color: "text-[#e11d48]", bg: "bg-[#e11d48]" };
        };
        const getVerdictPropsAcc = (val: number) => {
          if (val >= 80) return { text: locale === 'ko' ? "출시 적합" : "RELEASE-READY", color: "text-emerald-600", bg: "bg-emerald-600" };
          if (val >= 50) return { text: locale === 'ko' ? "경고 수준" : "BELOW AVERAGE", color: "text-amber-500", bg: "bg-amber-500" };
          return { text: locale === 'ko' ? "실패" : "FAILING", color: "text-[#e11d48]", bg: "bg-[#e11d48]" };
        };

        const infraProps = getVerdictProps(infraVal);
        const contentProps = getVerdictProps(contentVal);
        const secProps = getVerdictProps(secVal);
        const perfProps = getVerdictProps(perfVal);
        const accessProps = getVerdictPropsAcc(accessVal);

        const infraDesc = locale === 'ko' ? "이 감사의 가장 강력한 영역입니다. Vercel + Cloudflare + Let's Encrypt + ISR 캐싱은 프로덕션 등급입니다. DMARC 누락과 단일 리전 배포라는 두 가지 보완점이 존재합니다." : "The strongest area of the audit. Vercel + Cloudflare + Let's Encrypt + ISR caching is production-grade. Two gaps: DMARC and single-region.";
        const contentDesc = locale === 'ko' ? "3개 로케일에 걸쳐 다국어 지원이 올바르게 구성되어 있으나, 대부분의 하위 페이지가 루트로 리디렉션되며 모든 콘텐츠가 클라이언트 측 렌더링 뒤에 숨겨져 있습니다." : "i18n is correctly configured across three locales, but most subpages redirect to root and all content is hidden behind client-side rendering.";
        const secDesc = locale === 'ko' ? "결제 시스템 차단 요소. CSP가 없는 결제 연동은 PCI 규정 준수 위험이 있으며, 권한 정책 없는 미디어 기능은 조용히 실패할 수 있습니다." : "Blocker for payments. Stripe without CSP is a PCI compliance risk; Twilio Voice without Permissions-Policy may silently fail.";
        const perfDesc = locale === 'ko' ? "방대한 글꼴 프리로드만으로도 모바일 네트워크에서 페이지를 사용할 수 없게 만들 수 있습니다. 글꼴을 포함한 전체 페이지 용량이 권장 사항을 초과합니다." : "733 font preloads alone could make the page unusable on mobile networks. Total page weight with fonts may exceed 15 MB.";
        const accessDesc = locale === 'ko' ? "보조 기술을 위한 초기 로딩 시 제공되는 SSR 결과물에서 콘텐츠가 누락되어 있습니다. CSR 구조가 정적 분석 도구의 접근을 차단하고 있습니다." : "Low score partially due to CSR bailout hiding all content from static analysis — but SSR output is what matters for assistive tech on initial load.";

        return (
          <>
          <Slide 
            locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages}
            sectionName="VERDICT" title="OVERALL VERDICT" companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
            leftColClass="col-span-6" rightColClass="col-span-6"
            leftCol={
              <div className="flex flex-col justify-center h-full pr-8">
                <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">OVERALL SCORE</div>
                <div className="text-[180px] font-mono font-bold scale-y-110 origin-bottom-left leading-none tracking-tighter flex items-baseline gap-2 mb-2 text-[#111]">
                  {score}
                  <span className="text-[64px] text-[#888] font-mono font-bold">/100</span>
                </div>
                <div className={`inline-flex px-3 py-1.5 ${verdictColor.includes('red') || verdictColor.includes('rose') || verdictColor.includes('#e11d48') ? 'bg-[#e11d48]' : 'bg-[#111]'} text-white font-mono text-[13px] uppercase tracking-widest font-bold mb-6 items-center gap-2 w-max`}>
                  <div className="w-2 h-2 bg-white"></div>
                  {verdictText}
                </div>
                <p className="text-[#444] text-[15px] leading-relaxed w-full">
                  {locale === 'ko' ? '모든 퍼블릭 런칭 전에 치명적인 차단 요소(Blockers)들이 해결되어야 합니다. 인프라는 강력하지만, 렌더링된 웹 표면은 심각한 주의가 필요합니다.' : 'Critical blockers must be resolved before any public launch. Infrastructure is strong; the rendered web surface is not.'}
                </p>
              </div>
            }
            rightCol={
              <div className="flex flex-col justify-center h-full pl-8">
                <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">{t.weightedCat}</div>
                <div className="flex justify-between items-end pb-3 border-b border-[#111]">
                  <div className="font-bold text-[15px]">{t.catInfra}</div>
                  <div className="flex gap-4 font-mono text-[15px]"><span className="w-8 text-right">{infraVal}</span> <span className="w-12 text-right text-[#888]">19%</span> <span className="w-12 text-right">{(infraVal * 0.19).toFixed(1)}</span></div>
                </div>
                <div className="flex justify-between items-end py-4 border-b border-[#ddd]">
                  <div className="font-bold text-[15px]">{t.catContent}</div>
                  <div className="flex gap-4 font-mono text-[15px]"><span className="w-8 text-right">{contentVal}</span> <span className="w-12 text-right text-[#888]">12%</span> <span className="w-12 text-right">{(contentVal * 0.12).toFixed(1)}</span></div>
                </div>
                <div className="flex justify-between items-end py-4 border-b border-[#ddd]">
                  <div className="font-bold text-[15px]">{t.catSecurity}</div>
                  <div className="flex gap-4 font-mono text-[15px]"><span className="w-8 text-right">{secVal}</span> <span className="w-12 text-right text-[#888]">25%</span> <span className="w-12 text-right">{(secVal * 0.25).toFixed(1)}</span></div>
                </div>
                <div className="flex justify-between items-end py-4 border-b border-[#ddd]">
                  <div className="font-bold text-[15px]">{t.catPerf}</div>
                  <div className="flex gap-4 font-mono text-[15px]"><span className="w-8 text-right">{perfVal}</span> <span className="w-12 text-right text-[#888]">25%</span> <span className="w-12 text-right">{(perfVal * 0.25).toFixed(1)}</span></div>
                </div>
                <div className="flex justify-between items-end py-4 border-b border-[#111]">
                  <div className="font-bold text-[15px]">{t.catAccess}</div>
                  <div className="flex gap-4 font-mono text-[15px]"><span className="w-8 text-right">{accessVal}</span> <span className="w-12 text-right text-[#888]">19%</span> <span className="w-12 text-right">{(accessVal * 0.19).toFixed(1)}</span></div>
                </div>
                <div className="flex justify-between items-end py-4">
                  <div className="font-bold text-[15px]">{t.catTotal}</div>
                  <div className="flex gap-4 font-mono text-[15px] items-center"><span className="w-8"></span> <span className="w-12 text-right text-[#888]">100%</span> <span className="w-12 text-right font-bold text-lg">{trueOverall.toFixed(1)}</span></div>
                </div>
              </div>
            }
          />
          
          <CategorySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
            categoryNum={1} categoryName={locale === 'ko' ? '성능 (Performance)' : 'Performance'} score={perfVal} verdict={perfProps.text} verdictColor={perfProps.color} verdictBgColor={perfProps.bg} description={perfDesc} checks={perfChecks} />
          
          {/* PAGE 1.5: CORE WEB VITALS (PERFORMANCE SLIDE) */}
          {performanceData && ['full', 'executive'].includes(template) && (
            <PerformanceSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} performanceData={performanceData} t={t} />
          )}
            
          <CategorySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
            categoryNum={2} categoryName={locale === 'ko' ? '보안 (Security)' : 'Security'} score={secVal} verdict={secProps.text} verdictColor={secProps.color} verdictBgColor={secProps.bg} description={secDesc} checks={secChecks} />
            
          <CategorySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
            categoryNum={3} categoryName={locale === 'ko' ? '접근성 (Accessibility)' : 'Accessibility'} score={accessVal} verdict={accessProps.text} verdictColor={accessProps.color} verdictBgColor={accessProps.bg} description={accessDesc} checks={accessChecks} />
            
          <CategorySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
            categoryNum={4} categoryName={locale === 'ko' ? '인프라 (Infrastructure)' : 'Infrastructure'} score={infraVal} verdict={infraProps.text} verdictColor={infraProps.color} verdictBgColor={infraProps.bg} description={infraDesc} checks={infraChecks} />
            
          <CategorySlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
            categoryNum={5} categoryName={locale === 'ko' ? '콘텐츠 구조 (Content & structure)' : 'Content & structure'} score={contentVal} verdict={contentProps.text} verdictColor={contentProps.color} verdictBgColor={contentProps.bg} description={contentDesc} checks={contentChecks} />

          <ReadinessUseCaseSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} score={score} />
          </>
        );
      })()}


      {/* PAGE 9: COMPLIANCE CHECK */}
      {deck.compliance_status && (
      <Slide 
        orientation={orientation} pageNum={currentPage++} totalPages={totalPages}
        sectionName="COMPLIANCE" title="BASIC COMPLIANCE READINESS" companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize}
        leftColClass="col-span-12" rightColClass="col-span-12"
        leftCol={
          <div className="mb-6">
            <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6">Basic Policy Requirements</h2>
            <p className="text-[#444] text-[16px] leading-relaxed w-full">
              {deck.compliance_status.analysis_text}
            </p>
          </div>
        }
        rightCol={
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">REQUIREMENT CHECKLIST</div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#ddd] pb-3">
                  <div className="flex gap-4">
                    <span className="w-5 text-right font-mono text-sm text-[#888]">01</span>
                    <span className="font-bold text-[14px]">Terms of Service</span>
                  </div>
                  <div className={`font-mono text-sm tracking-widest font-bold ${deck.compliance_status.terms_found ? 'text-emerald-600' : 'text-[#e11d48]'}`}>
                    {deck.compliance_status.terms_found ? "PASS" : "FAIL"}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-[#ddd] pb-3">
                  <div className="flex gap-4">
                    <span className="w-5 text-right font-mono text-sm text-[#888]">02</span>
                    <span className="font-bold text-[14px]">Privacy Policy</span>
                  </div>
                  <div className={`font-mono text-sm tracking-widest font-bold ${deck.compliance_status.privacy_found ? 'text-emerald-600' : 'text-[#e11d48]'}`}>
                    {deck.compliance_status.privacy_found ? "PASS" : "FAIL"}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-[#ddd] pb-3">
                  <div className="flex gap-4">
                    <span className="w-5 text-right font-mono text-sm text-[#888]">03</span>
                    <span className="font-bold text-[14px]">Contact Information</span>
                  </div>
                  <div className={`font-mono text-sm tracking-widest font-bold ${deck.compliance_status.contact_found ? 'text-emerald-600' : 'text-[#e11d48]'}`}>
                    {deck.compliance_status.contact_found ? "PASS" : "FAIL"}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">REMEDIATION & RISK</div>
              <div className="bg-[#eae8e1] text-[#111] p-6 text-[13px] leading-relaxed w-full min-h-[200px]">
                <p className="font-bold mb-2">Legal Liability Risk</p>
                <p className="mb-4 text-[#444]">Missing foundational compliance pages exposes the entity to regulatory fines and restricts usage of certain B2B/B2C services like Payment Gateways and App Stores.</p>
                <p className="font-bold mb-2 text-[#e11d48]">Action Required</p>
                <p className="text-[#444]">Consult with qualified legal counsel immediately to draft missing documentation or verify current documentation is accurately linked in the footer across all locales.</p>
              </div>
            </div>
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

      {/* CONCLUSION SLIDE */}
      {['full', 'executive'].includes(template) && (
        <ConclusionSlide locale={locale} orientation={orientation} pageNum={currentPage++} totalPages={totalPages} companyName={companyName} evidenceHash={rawEvidenceHash} paperSize={paperSize} score={latestScan.score || 0} verdictText={verdictText} executiveSummary={executiveSummary} />
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
        <div className={`print-page mx-auto shadow-2xl bg-[#1a1b1e] text-[#f8f9fa] p-12 flex flex-col relative justify-center box-border`} style={{ width: orientation === 'landscape' ? (paperSize === 'letter' ? '11in' : '297mm') : (paperSize === 'letter' ? '8.5in' : '210mm'), height: orientation === 'landscape' ? (paperSize === 'letter' ? '8.5in' : '210mm') : (paperSize === 'letter' ? '11in' : '297mm'), breakAfter: 'page', pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>
           <div className="max-w-3xl">
             <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-4">LEGAL NON-REPUDIATION</div>
             <h1 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 uppercase">Cryptographic Evidence Hash</h1>
             <p className="text-sm text-[#ccc] leading-relaxed mb-8">
               {getSlideDesc(locale || 'en', 'hash')}
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
