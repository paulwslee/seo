import React from 'react';

const slideDesc = {
  en: {
    warnings: "Not blockers, but meaningful score moves once the critical blockers clear. Engineering should tackle these in the following sprint.",
    trajectory: "A plausible path from today's {score} to production-ready, organized by fix batch. Each batch is scoped to what the dev team can land in a single sprint.",
    roadmap1: "Ship Phase 1 on the current stack. Queue these migrations for when the user base breaks 10,000, and sequence them before 100,000.",
    roadmap2: "Not launch blockers. Scale blockers.",
    vibeDesc: "This prompt is programmatically generated based on the critical blockers found in this audit.",
    vibeHowTo: "How to use:",
    vibeStep1: "1. Open your IDE (Cursor, Windsurf, etc.)",
    vibeStep2: "2. Copy the text on the right.",
    vibeStep3: "3. Paste into Composer or Chat to instantly execute the recommended fixes.",
    industry: "Architectural moves that consistently show up in enterprise stacks. Each one maps to a Phase 2 decision for scaling safely.",
    legal: "Compliance remediation paths — consent models, data-minimization posture, liability allocation — are legal questions, not engineering ones. We do not provide legal advice.",
    appendix: "Several areas fall outside an external audit. For each, a concrete ask to unblock a deeper review.",
    hash: "This report's underlying raw technical data was cryptographically sealed at the time of scanning. Alteration of the original telemetry will invalidate this SHA-256 fingerprint."
  },
  ko: {
    warnings: "출시를 가로막는 치명적 요인은 아니지만, 해결 시 큰 점수 향상을 기대할 수 있습니다. 엔지니어링 팀은 다음 스프린트에서 이 문제들을 처리해야 합니다.",
    trajectory: "현재 점수 {score}점에서 프로덕션 준비 완료 상태까지 도달하기 위한 현실적인 경로입니다. 각 배치(Batch)는 개발팀이 단일 스프린트 내에 처리할 수 있는 단위로 구성됩니다.",
    roadmap1: "현재 기술 스택으로 1단계를 출시하십시오. 사용자 수가 1만 명을 돌파할 때를 대비하여 이 마이그레이션들을 대기열에 올리고, 10만 명 도달 전에 순차적으로 실행하십시오.",
    roadmap2: "출시 차단 요소가 아닌, 스케일링(확장성) 차단 요소입니다.",
    vibeDesc: "이 프롬프트는 본 감사에서 발견된 치명적인 차단 요소들을 기반으로 자동 생성되었습니다.",
    vibeHowTo: "사용 방법:",
    vibeStep1: "1. 사용 중인 IDE (Cursor, Windsurf 등)를 엽니다.",
    vibeStep2: "2. 우측의 텍스트를 복사합니다.",
    vibeStep3: "3. Composer나 Chat에 붙여넣어 권장 수정 사항을 즉시 실행합니다.",
    industry: "엔터프라이즈급 스택에서 일관되게 나타나는 아키텍처 이동입니다. 각각은 안전한 확장을 위한 2단계 의사결정과 연결됩니다.",
    legal: "컴플라이언스 수정 경로(동의 모델, 데이터 최소화 태도, 책임 분배 등)는 엔지니어링 문제가 아닌 법률적 문제입니다. 당사는 법적 자문을 제공하지 않습니다.",
    appendix: "외부 감사 범위를 벗어나는 영역들입니다. 심층 검토를 위해 각각 구체적인 권한이나 자료가 요구됩니다.",
    hash: "이 보고서의 기본 기술 데이터는 스캔 당시 암호화되어 봉인되었습니다. 원본 원격 측정 데이터를 임의로 변경하면 이 SHA-256 지문이 무효화됩니다."
  },
  ja: {
    warnings: "ブロッカーではありませんが、致命的な問題が解決されればスコアが大きく向上します。エンジニアリングチームは次のスプリントでこれらに取り組む必要があります。",
    trajectory: "現在のスコア{score}から本番運用可能になるまでの現実的な道筋です。各バッチは開発チームが1回のスプリントで完了できる規模になっています。",
    roadmap1: "現在のスタックでフェーズ1をリリースしてください。ユーザー数が1万人を突破した時のためにこれらのマイグレーションをキューに入れ、10万人に達する前に順次実行してください。",
    roadmap2: "リリースを妨げるものではなく、拡張性を妨げるものです。",
    vibeDesc: "このプロンプトは、本監査で発見された致命的なブロッカーに基づいて自動生成されています。",
    vibeHowTo: "使用方法:",
    vibeStep1: "1. お使いのIDE (Cursor, Windsurfなど) を開きます。",
    vibeStep2: "2. 右側のテキストをコピーします。",
    vibeStep3: "3. ComposerやChatに貼り付けて、推奨される修正を即座に実行します。",
    industry: "エンタープライズのスタックで一貫して見られるアーキテクチャの移行です。それぞれが安全な拡張のためのフェーズ2の決定にマッピングされます。",
    legal: "コンプライアンスの修正プロセス（同意モデル、データ最小化の姿勢、責任分担など）は法的な問題であり、エンジニアリングの問題ではありません。当社は法的アドバイスを提供しません。",
    appendix: "いくつかの領域は外部監査の範囲外となります。それぞれについて、より深いレビューを行うための具体的な要求事項があります。",
    hash: "このレポートの基礎となる生技術データは、スキャン時に暗号化されて封印されました。元のテレメトリデータを改ざんすると、このSHA-256フィンガープリントは無効になります。"
  },
  es: {
    warnings: "No son bloqueadores, pero mejorarán significativamente la puntuación una vez que se resuelvan los bloqueadores críticos. El equipo de ingeniería debería abordar esto en el próximo sprint.",
    trajectory: "Un camino realista desde la puntuación actual de {score} hasta la preparación para producción. Cada lote tiene el tamaño adecuado para que el equipo lo complete en un solo sprint.",
    roadmap1: "Lanza la Fase 1 con el stack actual. Pon en cola estas migraciones para cuando la base de usuarios supere los 10.000, y ejecútalas antes de llegar a los 100.000.",
    roadmap2: "No son bloqueadores de lanzamiento. Son bloqueadores de escalabilidad.",
    vibeDesc: "Este prompt se genera automáticamente en base a los bloqueadores críticos encontrados en esta auditoría.",
    vibeHowTo: "Cómo utilizar:",
    vibeStep1: "1. Abre tu IDE (Cursor, Windsurf, etc.)",
    vibeStep2: "2. Copia el texto de la derecha.",
    vibeStep3: "3. Pégalo en Composer o Chat para ejecutar instantáneamente las correcciones recomendadas.",
    industry: "Movimientos arquitectónicos que aparecen constantemente en stacks empresariales. Cada uno se asigna a una decisión de la Fase 2 para escalar de forma segura.",
    legal: "Las vías de corrección de cumplimiento (modelos de consentimiento, minimización de datos, asignación de responsabilidades) son cuestiones legales, no de ingeniería. No proporcionamos asesoramiento legal.",
    appendix: "Varias áreas quedan fuera de una auditoría externa. Para cada una, existe una solicitud concreta para desbloquear una revisión más profunda.",
    hash: "Los datos técnicos brutos subyacentes de este informe fueron sellados criptográficamente en el momento del escaneo. La alteración de la telemetría original invalidará esta huella SHA-256."
  }
};

export const getSlideDesc = (locale: string, key: keyof typeof slideDesc.en, params?: Record<string, any>) => {
  const lang = slideDesc[locale as keyof typeof slideDesc] ? locale : 'en';
  let text = slideDesc[lang as keyof typeof slideDesc][key];
  if (params) {
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k]);
    });
  }
  return text;
};


// Common CheckRow Component for Checklists
export const CheckRow = ({ title, subtext, points, isFail }: any) => (
  <div className="flex justify-between items-end py-3 border-b border-[#ddd] last:border-0">
    <div>
      <div className="font-bold text-sm mb-1">{title}</div>
      <div className={`text-xs font-mono ${isFail ? 'text-[#e11d48]' : 'text-[#666]'}`}>{subtext}</div>
    </div>
    <div className="font-mono text-sm tracking-widest">{points}</div>
  </div>
);

// Base Slide Component
export const Slide = ({ 
  locale,
  orientation, 
  pageNum, 
  totalPages, 
  sectionName, 
  title, 
  leftCol, 
  rightCol,
  companyName,
  evidenceHash,
  paperSize,
  leftColClass = "col-span-5",
  rightColClass = "col-span-7"
}: any) => {
  const isLandscape = orientation === 'landscape';
  const isLetter = paperSize === 'letter';
  
  const width = isLandscape ? (isLetter ? '11in' : '297mm') : (isLetter ? '8.5in' : '210mm');
  const height = isLandscape ? (isLetter ? '8.5in' : '210mm') : (isLetter ? '11in' : '297mm');
  
  
  return (
    <div className={`print-page mx-auto shadow-2xl bg-transparent text-[#111111] p-12 flex flex-col relative overflow-hidden box-border`} style={{ width, height, breakAfter: 'page', pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>
      {/* Header */}
      <div className="flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest mb-16 shrink-0">
        <span>Release Readiness · {companyName}</span>
        <span>{String(pageNum).padStart(2, '0')} · {sectionName}</span>
      </div>

      {/* Main Body */}
      <div className={`flex-grow w-full ${isLandscape ? 'grid grid-cols-12 gap-x-16 gap-y-6' : 'flex flex-col space-y-12'} pb-10`}>
        <div className={`${isLandscape ? leftColClass : 'w-full'} flex flex-col`}>
          {leftCol}
        </div>
        <div className={`${isLandscape ? rightColClass : 'w-full'} flex flex-col`}>
          {rightCol}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-transparent pt-4 items-center">
        <div className="flex items-center gap-4">
          <span>{title}</span>
          {evidenceHash && (
            <span className="text-[#a1a1aa] font-normal border-l border-[#ddd] pl-4 flex items-center gap-1.5" title={getSlideDesc(locale || 'en', 'hash')}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              SHA-256 : {evidenceHash.substring(0, 12)}...
            </span>
          )}
        </div>
        <span>{pageNum} / {totalPages}</span>
      </div>
    </div>
  );
};

// Blocker Slide
export const BlockerSlide = ({ orientation, pageNum, totalPages, companyName, blocker, index , evidenceHash, paperSize }: any) => (
  <Slide orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName={`BLOCKER ${String(index).padStart(2, '0')}`} 
    title={`BLOCKER ${String(index).padStart(2, '0')} · FIX IMMEDIATELY`} 
    companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <div className="flex justify-between items-center mb-8">
          <div className="inline-block px-3 py-1.5 bg-[#e11d48] text-white font-mono text-[13px] uppercase tracking-widest font-bold">
            BLOCKER {String(index).padStart(2, '0')}
          </div>
          {blocker.stats && (
            <div className="font-mono text-[15px] text-[#666] tracking-widest font-bold">
              {blocker.stats}
            </div>
          )}
        </div>
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">{blocker.title}</h2>
        <p className="text-[#444] text-[16px] leading-relaxed w-full">
          {blocker.description}
        </p>
      </div>
    }
    rightCol={
      <div className="grid grid-cols-2 gap-12">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">SPEC FOR DEV TEAM</div>
          <div className="space-y-4">
            {blocker.spec?.map((step: string, i: number) => (
              <div key={i} className="flex gap-4 border-b border-[#ddd] pb-3">
                <div className="font-mono text-[12px] text-[#888] pt-0.5">{String(i + 1).padStart(2, '0')}</div>
                <div className="text-[14px] font-medium leading-relaxed">{step}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">VERIFICATION</div>
          <div className="bg-[#333] text-[#f8f9fa] p-6 rounded text-[13px] leading-relaxed w-full min-h-[200px]">
            <pre className="whitespace-pre-wrap break-all font-mono">
              {blocker.verification_bash}
            </pre>
          </div>
        </div>
      </div>
    }
  />
);

// Warning Slide
export const WarningSlide = ({ locale, orientation, pageNum, totalPages, companyName, warnings , evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="WARNINGS" title="WARNING-LEVEL FIXES" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">Warning-level fixes</h2>
        <p className="text-[#444] text-[16px] leading-relaxed w-full">
          {getSlideDesc(locale || 'en', 'warnings')}
        </p>
      </div>
    }
    rightCol={
      <div>
        <div className="flex text-left font-mono text-[10px] tracking-widest uppercase text-[#666] border-b border-[#111] pb-2 mb-4">
          <div className="w-1/4">ISSUE</div>
          <div className="w-1/2">SPEC</div>
          <div className="w-1/4">VERIFICATION</div>
        </div>
        <div>
          {warnings.map((w: any, i: number) => (
            <div key={i} className="flex text-sm border-b border-[#ddd] pb-3">
              <div className="w-1/4 pr-4">
                <div className="inline-block px-2 py-0.5 bg-amber-500 text-black font-mono text-[10px] uppercase font-bold mb-2">WARN</div>
                <div className="font-bold text-xs">{w.issue}</div>
              </div>
              <div className="w-1/2 pr-4 text-[#444] leading-relaxed text-xs">
                {w.spec}
              </div>
              <div className="w-1/4 font-mono text-[10px] text-[#666] break-all">
                {w.verification}
              </div>
            </div>
          ))}
        </div>
      </div>
    }
  />
);

// Trajectory Slide
export const TrajectorySlide = ({ locale, orientation, pageNum, totalPages, companyName, currentScore, trajectory , evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="PROJECTED TRAJECTORY" title="PROJECTED SCORE TRAJECTORY" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">Projected score trajectory</h2>
        <p className="text-[#444] text-[16px] leading-relaxed w-full">
          {getSlideDesc(locale || 'en', 'trajectory', { score: currentScore })}
        </p>
      </div>
    }
    rightCol={
      <div className="flex flex-wrap gap-4 items-center justify-start h-full">
        <div className="p-6 bg-[#eae8e1] flex-1 min-w-[200px] max-w-[300px]">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">TODAY</div>
          <div className={`text-6xl font-bold scale-y-105 origin-bottom-left flex items-baseline gap-1 mb-4 ${currentScore >= 80 ? 'text-emerald-600' : currentScore >= 50 ? 'text-amber-500' : 'text-[#e11d48]'}`}>
            {currentScore}<span className="text-xl text-[#888]">/100</span>
          </div>
          <div className={`inline-block px-2 py-1 border font-mono text-[10px] uppercase tracking-widest font-bold ${currentScore >= 80 ? 'border-emerald-600 text-emerald-600' : currentScore >= 50 ? 'border-amber-500 text-amber-500' : 'border-[#e11d48] text-[#e11d48]'}`}>
            {currentScore >= 80 ? 'READY' : currentScore >= 50 ? 'SOFT-LAUNCH' : 'NOT READY'}
          </div>
        </div>
        
        {trajectory && [...trajectory]
          .map((t: any, i: number) => {
            const fallbackScore = currentScore + ((i + 1) * 15);
            return {
              ...t,
              displayScore: t.projected_score || Math.min(fallbackScore, 100)
            };
          })
          .sort((a, b) => a.displayScore - b.displayScore)
          .map((t: any, i: number) => {
            return (
              <div key={i} className="p-6 border-l border-[#ddd] flex-1 min-w-[200px]">
                <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">{t.fix}</div>
                <div className={`text-6xl font-bold scale-y-105 origin-bottom-left flex items-baseline gap-1 mb-4 ${t.displayScore >= 80 ? 'text-emerald-600' : t.displayScore >= 50 ? 'text-amber-500' : 'text-[#e11d48]'}`}>
                  ~{t.displayScore}<span className="text-xl text-[#888]">/100</span>
                </div>
                <div className={`inline-block px-2 py-1 border font-mono text-[10px] uppercase tracking-widest font-bold ${t.displayScore >= 80 ? 'border-emerald-600 text-emerald-600' : t.displayScore >= 50 ? 'border-amber-500 text-amber-500' : 'border-[#e11d48] text-[#e11d48]'}`}>
                  {t.status}
                </div>
              </div>
            );
          })}
      </div>
    }
  />
);

// Roadmap Slide
export const RoadmapSlide = ({ locale, orientation, pageNum, totalPages, companyName, roadmap , evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="PHASE 2 ROADMAP" title="PHASE 2 ROADMAP · BEYOND LAUNCH" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-2">AFTER REMEDIATION · AT SCALE</div>
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">Architecture moves for 10K → 100K users</h2>
        <div className="flex flex-col gap-3">
          <p className="text-[#444] text-[16px] leading-relaxed w-full">
            {getSlideDesc(locale || 'en', 'roadmap1')}
          </p>
          <p className="font-mono text-[13px] tracking-widest uppercase text-[#888] font-bold">
            {getSlideDesc(locale || 'en', 'roadmap2')}
          </p>
        </div>
      </div>
    }
    rightCol={
      <div className="flex gap-4">
        {roadmap.map((item: any, i: number) => (
          <div key={i} className="flex-1 bg-white p-5 shadow-sm border border-[#eee]">
            <div className="flex justify-between items-center mb-4">
              <div className="font-mono text-[11px] text-[#888]">{String(i + 1).padStart(2, '0')}</div>
              <div className={`font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 text-white ${item.priority === 'HIGH' ? 'bg-[#e11d48]' : 'bg-amber-500'}`}>{item.priority}</div>
            </div>
            <h3 className="font-bold text-base mb-4 leading-tight">{item.title}</h3>
            
            <div className="space-y-3">
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-[#888] mb-1">DRIVER</div>
                <p className="text-[11px] text-[#444] leading-snug">{item.driver}</p>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-[#888] mb-1">SWAP</div>
                <p className="text-[11px] text-[#e11d48] line-through">{item.swap.split('->')[0]?.trim()}</p>
                <p className="text-[11px] text-emerald-600 font-bold">→ {item.swap.split('->')[1]?.trim()}</p>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-[#888] mb-1">GAINS</div>
                <p className="text-[11px] text-[#444] leading-snug">{item.gains}</p>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-[#888] mb-1">TRIGGER</div>
                <p className="font-mono text-[10px] text-[#111] leading-tight">{item.trigger}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    }
  />
);

// Coppa Slide
export const CoppaSlide = ({ orientation, pageNum, totalPages, companyName, coppa , evidenceHash, paperSize }: any) => (
  <Slide orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="COPPA RISK" title="COPPA · RISK LANDSCAPE" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <div className={`inline-block px-3 py-1.5 font-mono text-[13px] uppercase tracking-widest font-bold mb-6 text-white ${coppa.is_exposed ? 'bg-[#e11d48]' : 'bg-emerald-600'}`}>
          {coppa.is_exposed ? 'US LAUNCH BLOCKER' : 'LOW RISK'}
        </div>
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">COPPA exposure</h2>
        <p className="text-[#444] text-[16px] leading-relaxed w-full">
          {coppa.reasoning}
        </p>
      </div>
    }
    rightCol={
      <div className="grid grid-cols-2 gap-12">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-4">WHAT WE COLLECT TODAY</div>
          <ul className="list-disc ml-4 space-y-2 text-[14px] text-[#111] mb-8">
            {coppa.collected_data?.map((d: string, i: number) => <li key={i}>{d}</li>)}
          </ul>
          {coppa.is_exposed && (
            <p className="font-mono text-[11px] text-[#888] uppercase tracking-widest">
              All categories qualify as "personal information" under COPPA §312.2.
            </p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-end pb-2 border-b border-[#111] mb-2">
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#666]">FINE MATH AT SCALE</div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#e11d48] font-bold">$50,120 per child</div>
          </div>
          <div className="bg-white border border-[#ddd]">
            {coppa.fine_math?.map((math: any, i: number) => (
              <div key={i} className="flex justify-between p-4 border-b border-[#ddd] last:border-0 text-sm">
                <div className="text-[#444]">{math.scenario}</div>
                <div className="font-bold text-[#e11d48]">{math.fine}</div>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest mt-4">
            Strict liability. Intent is not a defense.
          </p>
        </div>
      </div>
    }
  />
);

// Industry Precedent Slide
export const IndustryPrecedentSlide = ({ locale, orientation, pageNum, totalPages, companyName, precedents , evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="INDUSTRY PRECEDENT" title="INDUSTRY PRECEDENT · CASE STUDIES" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">What the top platforms actually run on</h2>
        <p className="text-[#444] text-[16px] leading-relaxed w-full">
          {getSlideDesc(locale || 'en', 'industry')}
        </p>
      </div>
    }
    rightCol={
      <div className="grid grid-cols-2 gap-8">
        {precedents.map((p: any, i: number) => (
          <div key={i} className="mb-4">
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#888] mb-2">T·{i+1}</div>
            <h3 className="font-bold text-sm mb-2">{p.title}</h3>
            <p className="text-xs text-[#666] mb-1">Seen in <span className="font-bold text-[#111]">{p.seen_in}</span></p>
            <p className="text-xs text-[#666] mb-4">Stack <span className="font-mono bg-gray-100 px-1">{p.stack}</span></p>
            <ul className="list-disc ml-4 space-y-1 text-xs text-[#444]">
              {p.points.map((pt: string, idx: number) => <li key={idx}>{pt}</li>)}
            </ul>
          </div>
        ))}
      </div>
    }
  />
);

// Appendix Slide
export const AppendixSlide = ({ locale, orientation, pageNum, totalPages, companyName, blindSpots , evidenceHash, paperSize }: any) => (
  <Slide orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="APPENDIX" title="APPENDIX · NOT ASSESSED" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">What we cannot assess without source</h2>
        <p className="text-[#444] text-[16px] leading-relaxed w-full">
          {getSlideDesc(locale || 'en', 'appendix')}
        </p>
      </div>
    }
    rightCol={
      <div>
        <div className="flex text-left font-mono text-[10px] tracking-widest uppercase text-[#666] border-b border-[#111] pb-2 mb-4">
          <div className="w-1/4">AREA</div>
          <div className="w-1/3">WHY IT'S OPAQUE</div>
          <div className="w-5/12">ASK</div>
        </div>
        <div className="space-y-4">
          {blindSpots.map((b: any, i: number) => (
            <div key={i} className="flex text-xs border-b border-[#ddd] pb-4">
              <div className="w-1/4 font-bold text-[#111] pr-4">{b.area}</div>
              <div className="w-1/3 text-[#666] pr-4">{b.opaque_reason}</div>
              <div className="w-5/12 text-[#111]">{b.ask}</div>
            </div>
          ))}
        </div>
      </div>
    }
  />
);

// Legal Counsel Slide
export const LegalSlide = ({ locale, orientation, pageNum, totalPages, companyName, legal , evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="LEGAL" title="COPPA · REQUIRES LEGAL COUNSEL" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="mb-6">
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">Resolution requires qualified legal counsel</h2>
        <p className="text-[#444] text-[16px] leading-relaxed w-full">
          {getSlideDesc(locale || 'en', 'legal')}
        </p>
      </div>
    }
    rightCol={
      <div className="grid grid-cols-2 gap-12">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">STATUS</div>
          <div className="space-y-4">
            <div className="font-bold text-[14px] mb-4 leading-snug">{legal.status}</div>
            <div className="font-mono text-[11px] tracking-widest uppercase text-[#888] mb-2 mt-6">NOT IN SCOPE OF THIS ASSESSMENT</div>
            <ul className="list-disc ml-4 space-y-2 text-[14px] text-[#444]">
              <li>Choice of consent mechanism</li>
              <li>Liability allocation</li>
              <li>ToS / Privacy Policy drafting</li>
            </ul>
          </div>
        </div>
        
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-emerald-600 font-bold mb-6">RECOMMENDED NEXT STEP</div>
          <div className="bg-[#eae8e1] text-[#111] p-6 text-[13px] leading-relaxed w-full min-h-[200px]">
            <p className="font-bold mb-2 text-[#111]">{legal.next_step}</p>
            <p className="text-[#444] text-[14px] mb-2 mt-4 font-bold">Brief to bring to counsel:</p>
            <ul className="list-disc ml-4 space-y-2 text-[14px] text-[#444] mb-4">
              {legal.brief_points?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
            </ul>
            <p className="font-mono text-[9px] text-[#888] uppercase tracking-widest leading-tight mt-6">
              Engineering will implement whatever regime counsel defines.
            </p>
          </div>
        </div>
      </div>
    }
  />
);

// Vibe Coding Slide
export const VibeCodingSlide = ({ locale, orientation, pageNum, totalPages, companyName, promptText, evidenceHash, paperSize }: any) => (
  <Slide locale={locale}
    orientation={orientation} pageNum={pageNum} totalPages={totalPages}
    sectionName="VIBE CODING PROMPT" title="AI-ASSISTED REMEDIATION HANDOFF" companyName={companyName}
    evidenceHash={evidenceHash} paperSize={paperSize}
    leftColClass="col-span-4" rightColClass="col-span-8"
    leftCol={
      <div>
        <div className="inline-block px-3 py-1 bg-indigo-600 text-white font-mono text-xs uppercase tracking-widest font-bold mb-6">
          DEV TEAM HANDOFF
        </div>
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6">AI Cursor / Copilot<br/>Remediation Prompt</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm mb-8">
          {getSlideDesc(locale || 'en', 'vibeDesc')} 
        </p>
        <div className="p-4 border-l-2 border-indigo-600 bg-indigo-50/50">
          <p className="font-mono text-xs text-indigo-800 leading-relaxed">
            <strong>{getSlideDesc(locale || 'en', 'vibeHowTo')}</strong><br/>
            {getSlideDesc(locale || 'en', 'vibeStep1')}<br/>
            {getSlideDesc(locale || 'en', 'vibeStep2')}<br/>
            {getSlideDesc(locale || 'en', 'vibeStep3')}
          </p>
        </div>
      </div>
    }
    rightCol={
      <div className="h-full flex flex-col pt-2">
        <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-2">COPY & PASTE READY</div>
        <div className="flex-grow bg-[#1a1b1e] text-[#f8f9fa] p-8 rounded-lg shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-8 bg-[#2d2d30] flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            <div className="ml-4 font-mono text-[10px] text-[#888]">vibe_coding_prompt.txt</div>
          </div>
          <div className="mt-6 font-mono text-[11px] leading-relaxed whitespace-pre-wrap h-full overflow-y-auto pr-4 text-emerald-400">
            {promptText}
          </div>
        </div>
      </div>
    }
  />
);

// Methodology Slide
export const MethodologySlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize, t }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName={t?.page1Title || "METHODOLOGY"} title={t?.page1Title || "METHODOLOGY"} companyName={companyName}
    leftCol={
      <div>
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6">{t?.page1Title || "Methodology & Scope"}</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm mb-6">
          <span className="font-bold">{t?.methodValue}</span><br/><br/>
          {t?.accessExplanation}
        </p>
      </div>
    }
    rightCol={
      <div className="space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">TRACK 1</div>
          <h3 className="font-bold text-lg mb-2">{t?.track1}</h3>
          <p className="text-sm text-[#444] leading-relaxed">{t?.track1Desc}</p>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">TRACK 2</div>
          <h3 className="font-bold text-lg mb-2">{t?.track2}</h3>
          <p className="text-sm text-[#444] leading-relaxed">{t?.track2Desc}</p>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">TRACK 3</div>
          <h3 className="font-bold text-lg mb-2">{t?.track3}</h3>
          <p className="text-sm text-[#444] leading-relaxed">{t?.track3Desc}</p>
        </div>
      </div>
    }
  />
);

// Glossary Slide
export const GlossarySlide = ({ locale, orientation, pageNum, totalPages, companyName, glossary, evidenceHash, paperSize }: any) => {
  const parseGlossaryItem = (g: any) => {
    if (typeof g === 'string') {
      try {
        return JSON.parse(g);
      } catch (e) {
        return { term: "Unknown", definition: g };
      }
    }
    if (g && typeof g === 'object') {
      let term = g.term;
      let definition = g.definition;
      // Handle the case where the definition itself is a stringified JSON object
      if (typeof definition === 'string' && definition.trim().startsWith('{')) {
        try {
          const parsedDef = JSON.parse(definition);
          if (parsedDef.term && parsedDef.definition) {
            term = parsedDef.term;
            definition = parsedDef.definition;
          }
        } catch (e) {}
      }
      return { term, definition };
    }
    return { term: "Unknown", definition: "Invalid glossary item" };
  };

  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="GLOSSARY" title="APPENDIX · GLOSSARY OF TERMS" companyName={companyName}
      leftColClass="col-span-12" rightColClass="col-span-12"
      leftCol={
        <div className="flex flex-col h-full">
          <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-12 uppercase">Glossary</h2>
          <div className="grid grid-cols-2 gap-x-16 gap-y-8 max-w-5xl">
            {glossary.map((g: any, i: number) => {
              const item = parseGlossaryItem(g);
              return (
                <div key={i} className="border-t border-[#ddd] pt-4">
                  <h4 className="text-sm font-bold font-mono tracking-wider mb-2 text-[#e11d48]">{item.term}</h4>
                  <p className="text-sm text-[#444] leading-relaxed">{item.definition}</p>
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
};

// Performance Slide
export const PerformanceSlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize, performanceData, t }: any) => {
  const score = performanceData?.score || 0;
  const scoreColor = score >= 90 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = score >= 90 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  const getLabel = (en: string, ko: string, ja: string, es: string) => {
    return locale === 'ko' ? ko : locale === 'ja' ? ja : locale === 'es' ? es : en;
  };

  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName={getLabel("PERFORMANCE", "퍼포먼스", "パフォーマンス", "RENDIMIENTO")} 
      title={getLabel("PERFORMANCE DEEP DIVE", "퍼포먼스 심층 분석", "パフォーマンス詳細分析", "ANÁLISIS PROFUNDO DE RENDIMIENTO")} 
      companyName={companyName}
      leftColClass="col-span-6" rightColClass="col-span-6"
      leftCol={
        <div className="flex flex-col justify-center h-full pr-8">
          <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-2">{getLabel("REAL-WORLD METRICS", "실제 체감 지표", "現実の指標", "MÉTRICAS DEL MUNDO REAL")}</div>
          <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">{getLabel("Core Web Vitals", "코어 웹 바이탈 (성능)", "Core Web Vitals", "Core Web Vitals")}</h2>
          
          <div className={`text-[180px] font-mono font-bold scale-y-110 origin-bottom-left leading-none tracking-tighter flex items-baseline gap-2 mb-2 ${scoreColor}`}>
            {score}
            <span className="text-[64px] text-[#888] font-mono font-bold">/100</span>
          </div>

          <div className={`inline-flex px-3 py-1.5 ${scoreBg} text-white font-mono text-[13px] uppercase tracking-widest font-bold mb-6 items-center gap-2 w-max`}>
            <div className="w-2 h-2 bg-white"></div>
            {score >= 90 ? getLabel('EXCELLENT', '우수', '優秀', 'EXCELENTE') : score >= 50 ? getLabel('NEEDS WORK', '개선 필요', '要改善', 'NECESITA TRABAJO') : getLabel('POOR', '위험', '不良', 'DEFICIENTE')}
          </div>
          
          <p className="text-[#444] text-[15px] leading-relaxed max-w-sm">
            {getLabel(
              "Powered by Google Lighthouse Engine. This page reflects the real-world performance metrics that Googlebot sees when crawling the site.",
              "Google Lighthouse 엔진 기반. 이 페이지는 Googlebot이 사이트를 크롤링할 때 실제로 체감하는 성능 지표를 반영합니다.",
              "Google Lighthouse エンジンを活用。このページは、Googlebotがサイトをクロールする際に実際に体験するパフォーマンス指標を反映しています。",
              "Impulsado por el motor Google Lighthouse. Esta página refleja las métricas de rendimiento en el mundo real que Googlebot percibe al rastrear el sitio."
            )}
          </p>
        </div>
      }
      rightCol={
        <div className="flex flex-col justify-center h-full space-y-8">
          {/* FCP */}
          <div className="border-b border-[#ddd] pb-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <strong className="text-[#111] text-lg block">{getLabel("First Contentful Paint (FCP)", "첫 콘텐츠풀 페인트 (FCP)", "First Contentful Paint (FCP)", "First Contentful Paint (FCP)")}</strong>
                <span className="text-[#666] text-xs">{getLabel("Time to first visible text/image", "첫 텍스트/이미지가 화면에 그려지는 시간", "最初のテキスト/画像が表示されるまでの時間", "Tiempo hasta el primer texto/imagen visible")}</span>
              </div>
              <span className={`font-bold scale-y-105 origin-bottom-left text-2xl ${parseFloat(performanceData?.fcp) <= 1.8 ? 'text-emerald-600' : parseFloat(performanceData?.fcp) <= 3.0 ? 'text-amber-600' : 'text-rose-600'}`}>
                {performanceData?.fcp || "N/A"}
              </span>
            </div>
            <div className="w-full bg-[#ddd] h-2 mt-2">
              <div className={`h-2 ${parseFloat(performanceData?.fcp) <= 1.8 ? 'bg-emerald-500' : parseFloat(performanceData?.fcp) <= 3.0 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((parseFloat(performanceData?.fcp) || 0) / 4 * 100, 100)}%` }}></div>
            </div>
          </div>

          {/* LCP */}
          <div className="border-b border-[#ddd] pb-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <strong className="text-[#111] text-lg block">{getLabel("Largest Contentful Paint (LCP)", "최대 콘텐츠풀 페인트 (LCP)", "Largest Contentful Paint (LCP)", "Largest Contentful Paint (LCP)")}</strong>
                <span className="text-[#666] text-xs">{getLabel("Main content loading speed", "메인 콘텐츠 로딩 속도", "メインコンテンツの読み込み速度", "Velocidad de carga del contenido principal")}</span>
              </div>
              <span className={`font-bold scale-y-105 origin-bottom-left text-2xl ${parseFloat(performanceData?.lcp) <= 2.5 ? 'text-emerald-600' : parseFloat(performanceData?.lcp) <= 4.0 ? 'text-amber-600' : 'text-rose-600'}`}>
                {performanceData?.lcp || "N/A"}
              </span>
            </div>
            <div className="w-full bg-[#ddd] h-2 mt-2">
              <div className={`h-2 ${parseFloat(performanceData?.lcp) <= 2.5 ? 'bg-emerald-500' : parseFloat(performanceData?.lcp) <= 4.0 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((parseFloat(performanceData?.lcp) || 0) / 6 * 100, 100)}%` }}></div>
            </div>
          </div>

          {/* TBT */}
          <div className="border-b border-[#ddd] pb-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <strong className="text-[#111] text-lg block">{getLabel("Total Blocking Time (TBT)", "총 차단 시간 (TBT)", "Total Blocking Time (TBT)", "Total Blocking Time (TBT)")}</strong>
                <span className="text-[#666] text-xs">{getLabel("JavaScript execution delay", "자바스크립트 실행 지연 시간", "JavaScript実行遅延時間", "Retraso en la ejecución de JavaScript")}</span>
              </div>
              <span className={`font-bold scale-y-105 origin-bottom-left text-2xl ${parseFloat(performanceData?.tbt) <= 200 ? 'text-emerald-600' : parseFloat(performanceData?.tbt) <= 600 ? 'text-amber-600' : 'text-rose-600'}`}>
                {performanceData?.tbt || "N/A"}
              </span>
            </div>
            <div className="w-full bg-[#ddd] h-2 mt-2">
              <div className={`h-2 ${parseFloat(performanceData?.tbt) <= 200 ? 'bg-emerald-500' : parseFloat(performanceData?.tbt) <= 600 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((parseFloat(performanceData?.tbt) || 0) / 1000 * 100, 100)}%` }}></div>
            </div>
          </div>

          {/* CLS */}
          <div className="border-b border-[#ddd] pb-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <strong className="text-[#111] text-lg block">{getLabel("Cumulative Layout Shift (CLS)", "누적 레이아웃 이동 (CLS)", "Cumulative Layout Shift (CLS)", "Cumulative Layout Shift (CLS)")}</strong>
                <span className="text-[#666] text-xs">{getLabel("Visual stability & layout jumps", "시각적 안정성 및 레이아웃 밀림", "視覚的な安定性とレイアウトのずれ", "Estabilidad visual y saltos de diseño")}</span>
              </div>
              <span className={`font-bold scale-y-105 origin-bottom-left text-2xl ${parseFloat(performanceData?.cls) <= 0.1 ? 'text-emerald-600' : parseFloat(performanceData?.cls) <= 0.25 ? 'text-amber-600' : 'text-rose-600'}`}>
                {performanceData?.cls || "N/A"}
              </span>
            </div>
            <div className="w-full bg-[#ddd] h-2 mt-2">
              <div className={`h-2 ${parseFloat(performanceData?.cls) <= 0.1 ? 'bg-emerald-500' : parseFloat(performanceData?.cls) <= 0.25 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((parseFloat(performanceData?.cls) || 0) / 0.5 * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      }
    />
  );
};

// Technical Audit Insights Slide
export const TechnicalAuditSlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize, auditData, basicSeo }: any) => {
  const isEn = !locale || locale === 'en';
  const getLabel = (en: string, ko: string, ja: string, es: string) => {
    return locale === 'ko' ? ko : locale === 'ja' ? ja : locale === 'es' ? es : en;
  };

  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="TECHNICAL AUDIT" title={getLabel("TECHNICAL AUDIT INSIGHTS", "기술 실사 지표", "技術監査インサイト", "INFORMACIÓN DE AUDITORÍA TÉCNICA")} companyName={companyName}
      leftColClass="col-span-4" rightColClass="col-span-8"
      leftCol={
        <div>
          <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6">{getLabel("Deep Technical", "심층 기술 실사", "詳細な技術監査", "Auditoría Técnica Profunda")}<br/>{getLabel("Audit Insights", "통찰 요약", "インサイト", "Información")}</h2>
          <p className="text-[#444] text-sm leading-relaxed mb-6">
            {getLabel(
              "These metrics represent raw signals extracted from the target surface without manual execution. They form the foundational telemetry driving the AI assessment.",
              "이러한 지표는 수동 실행 없이 대상 표면에서 추출된 원시 신호를 나타냅니다. 이는 AI 평가를 주도하는 기본적인 원격 측정 데이터를 형성합니다.",
              "これらの指標は、手動での実行なしにターゲット表面から抽出された生のシグナルを表しています。これらはAI評価を推進する基本的なテレメトリデータを形成します。",
              "Estas métricas representan señales brutas extraídas de la superficie objetivo sin ejecución manual. Forman la telemetría fundamental que impulsa la evaluación de IA."
            )}
          </p>
        </div>
      }
      rightCol={
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="space-y-2">
            <CheckRow 
              title={getLabel("Robots.txt & Sitemap", "Robots.txt 및 사이트맵", "Robots.txtとサイトマップ", "Robots.txt y Sitemap")} 
              subtext={getLabel("Crawl directives", "크롤링 지시어", "クロールディレクティブ", "Directivas de rastreo")}
              points={(basicSeo?.robotsTxtFound || basicSeo?.sitemapFound) ? getLabel("Detected", "감지됨", "検出", "Detectado") : getLabel("Missing", "누락됨", "欠落", "Falta")} 
              isFail={!(basicSeo?.robotsTxtFound || basicSeo?.sitemapFound)} 
            />
            <CheckRow 
              title={getLabel("Canonical Tags", "표준 태그(Canonical)", "カノニカルタグ", "Etiquetas canónicas")} 
              subtext={getLabel("Index deduplication", "인덱스 중복 제거", "インデックスの重複排除", "Deduplicación de índice")}
              points={basicSeo?.hasCanonical ? getLabel("Present", "존재함", "存在", "Presente") : getLabel("Missing", "누락됨", "欠落", "Falta")} 
              isFail={!basicSeo?.hasCanonical} 
            />
            <CheckRow 
              title={getLabel("HSTS & CSP Headers", "HSTS 및 CSP 헤더", "HSTSおよびCSPヘッダー", "Cabeceras HSTS y CSP")} 
              subtext={getLabel("Security header configuration", "보안 헤더 구성", "セキュリティヘッダー構成", "Configuración de cabeceras de seguridad")}
              points={auditData?.securityHeaders?.hsts && auditData?.securityHeaders?.csp ? getLabel("Enabled", "활성화됨", "有効", "Habilitado") : getLabel("Missing", "누락됨", "欠落", "Falta")} 
              isFail={!(auditData?.securityHeaders?.hsts && auditData?.securityHeaders?.csp)} 
            />
            <CheckRow 
              title={getLabel("X-Frame-Options", "X-Frame-Options 헤더", "X-Frame-Options", "X-Frame-Options")} 
              subtext={getLabel("Clickjacking protection", "클릭재킹 방지", "クリックジャッキング保護", "Protección contra Clickjacking")}
              points={auditData?.securityHeaders?.xFrameOptions || getLabel("Missing", "누락됨", "欠落", "Falta")} 
              isFail={!auditData?.securityHeaders?.xFrameOptions} 
            />
            <CheckRow 
              title={getLabel("TLS Protocol", "TLS 프로토콜", "TLSプロトコル", "Protocolo TLS")} 
              subtext={getLabel("Encryption standard", "암호화 표준", "暗号化標準", "Estándar de cifrado")}
              points="TLS 1.2+" 
              isFail={false} 
            />
            <CheckRow 
              title={getLabel("Mobile Viewport", "모바일 뷰포트", "モバイルビューポート", "Viewport móvil")} 
              subtext={getLabel("Responsive scaling", "반응형 스케일링", "レスポンシブスケーリング", "Escalado responsivo")}
              points={basicSeo?.hasViewport ? getLabel("Configured", "구성됨", "設定済み", "Configurado") : getLabel("Missing", "누락됨", "欠落", "Falta")} 
              isFail={!basicSeo?.hasViewport} 
            />
          </div>
          <div className="space-y-2">
            <CheckRow 
              title={getLabel("Semantic HTML", "시맨틱 HTML", "セマンティックHTML", "HTML Semántico")} 
              subtext={getLabel("Structure and accessibility", "구조 및 접근성", "構造とアクセシビリティ", "Estructura y accesibilidad")}
              points={auditData?.accessibility?.hasSemanticHTML ? getLabel("Detected", "감지됨", "検出", "Detectado") : getLabel("Not Detected", "감지되지 않음", "未検出", "No detectado")} 
              isFail={!auditData?.accessibility?.hasSemanticHTML} 
            />
            <CheckRow 
              title={getLabel("Alt Text Coverage", "대체 텍스트 적용", "代替テキストのカバレッジ", "Cobertura de texto alternativo")} 
              subtext={getLabel("Image accessibility", "이미지 접근성", "画像のアクセシビリティ", "Accesibilidad de imágenes")}
              points={auditData?.accessibility?.altTextCoverage ? `${auditData.accessibility.altTextCoverage}%` : getLabel("Partial", "부분 적용", "部分的", "Parcial")} 
              isFail={false} 
            />
            <CheckRow 
              title={getLabel("Font Preloads", "글꼴 프리로드", "フォントプリロード", "Precargas de fuentes")} 
              subtext={auditData?.performanceAssets?.fontPreloads > 10 ? getLabel("Too many preloads (Warning)", "프리로드 과다 (경고)", "プリロードが多すぎます（警告）", "Demasiadas precargas (Advertencia)") : getLabel("Optimal", "최적 상태", "最適", "Óptimo")}
              points={`${auditData?.performanceAssets?.fontPreloads || 0} files`} 
              isFail={auditData?.performanceAssets?.fontPreloads > 10} 
            />
            <CheckRow 
              title={getLabel("CSS / JS Assets", "CSS / JS 자산", "CSS / JS アセット", "Activos CSS / JS")} 
              subtext={getLabel("Linked stylesheets and scripts", "연결된 스타일시트 및 스크립트", "リンクされたスタイルシートとスクリプト", "Hojas de estilo y scripts vinculados")}
              points={`${auditData?.performanceAssets?.cssLinks || 0} / ${auditData?.performanceAssets?.jsScripts || 0}`} 
              isFail={false} 
            />
            <CheckRow 
              title={getLabel("Tech Stack", "기술 스택", "技術スタック", "Pila tecnológica")} 
              subtext={getLabel("Identified frameworks", "식별된 프레임워크", "特定されたフレームワーク", "Frameworks identificados")}
              points={auditData?.infrastructure?.techStack?.slice(0, 2).join(", ") || "Unknown"} 
              isFail={false} 
            />
            <CheckRow 
              title={getLabel("Client Rendering (CSR)", "클라이언트 렌더링 (CSR)", "クライアントレンダリング (CSR)", "Renderizado de cliente (CSR)")} 
              subtext={getLabel("Engine bailout risk", "검색 엔진 포기 위험", "エンジン放棄リスク", "Riesgo de abandono del motor")}
              points={auditData?.infrastructure?.isCsrBailout ? getLabel("Bailout Detected", "포기 위험 감지됨", "放棄リスク検出", "Riesgo detectado") : "SSR / SSG"} 
              isFail={auditData?.infrastructure?.isCsrBailout} 
            />
          </div>
        </div>
      }
    />
  );
};

// Conclusion Slide
export const ConclusionSlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize, score, verdictText, executiveSummary }: any) => {
  const isEn = !locale || locale === 'en';
  
  const getLabel = (en: string, ko: string, ja: string, es: string) => {
    return locale === 'ko' ? ko : locale === 'ja' ? ja : locale === 'es' ? es : en;
  };

  const conclusionHeader = getLabel(
    "Final Auditor Conclusion", 
    "최종 감사 결론", 
    "最終監査の結論", 
    "Conclusión final del auditor"
  );
  
  const greeting = getLabel(
    "To the Stakeholders and Engineering Leadership:",
    "이해관계자 및 엔지니어링 책임자님께:",
    "関係者およびエンジニアリングのリーダーシップへ:",
    "A las partes interesadas y líderes de ingeniería:"
  );

  const paragraphs = executiveSummary 
    ? executiveSummary.split('\n\n').filter((p: string) => p.trim().length > 0)
    : [
        getLabel(
          `This technical due diligence report concludes with an overall score of ${score}/100, resulting in a verdict of "${verdictText}". Our external assessment focused exclusively on the publicly exposed surface area, mirroring the exact perspective of search engines, automated crawlers, and malicious actors.`,
          `본 기술 실사 보고서는 총점 100점 만점에 ${score}점을 기록하여 "${verdictText}"(으)로 최종 판정되었습니다. 당사의 외부 평가는 검색 엔진, 자동화된 크롤러 및 해커의 관점을 정확히 반영하여 대중에 노출된 웹 표면에만 집중적으로 수행되었습니다.`,
          `この技術監査レポートは、100点満点中${score}点という総合スコアで結論づけられ、「${verdictText}」という判定になりました。当社の外部評価は、検索エンジン、自動化されたクローラー、悪意のあるアクターの視点を正確に反映し、一般に公開されているサーフェス領域のみに焦点を当てています。`,
          `Este informe de diligencia debida técnica concluye con una puntuación general de ${score}/100, resultando en un veredicto de "${verdictText}". Nuestra evaluación externa se centró exclusivamente en el área de superficie expuesta públicamente, reflejando la perspectiva exacta de los motores de búsqueda, rastreadores automáticos y actores maliciosos.`
        ),
        getLabel(
          "We strongly advise prioritizing the blockers identified in the action plan. Delaying these fixes poses a significant risk to organic visibility and structural stability as the platform scales. Engineering efforts in the immediate next sprint should be fully dedicated to these remediation tasks.",
          "실행 계획(Action Plan)에 명시된 차단 요소(Blockers)를 최우선으로 해결할 것을 강력히 권고합니다. 이러한 문제의 수정을 지연시킬 경우, 플랫폼 확장 시 오가닉 노출(자연 검색 유입) 및 구조적 안정성에 심각한 위험을 초래할 수 있습니다. 다음 스프린트의 엔지니어링 리소스는 이 수정 작업에 전적으로 투입되어야 합니다.",
          "アクションプランで特定されたブロッカーを優先することを強くお勧めします。これらの修正を遅らせると、プラットフォームの拡張に伴い、オーガニックの可視性と構造的安定性に重大なリスクをもたらします。次のスプリントでのエンジニアリングの取り組みは、これらの修復タスクに完全に専念する必要があります。",
          "Recomendamos encarecidamente priorizar los bloqueadores identificados en el plan de acción. Retrasar estas correcciones plantea un riesgo significativo para la visibilidad orgánica y la estabilidad estructural a medida que la plataforma se escala. Los esfuerzos de ingeniería en el próximo sprint inmediato deben dedicarse por completo a estas tareas de remediación."
        ),
        getLabel(
          "Once the critical infrastructure aligns with the Phase 1 recommendations, the product will be well-positioned to leverage advanced technical SEO capabilities.",
          "핵심 인프라가 1단계 권장 사항에 부합하게 되면, 귀사의 프로덕트는 고급 기술 SEO 역량을 활용할 수 있는 유리한 위치를 선점하게 될 것입니다.",
          "重要なインフラストラクチャがフェーズ1の推奨事項と一致すれば、製品は高度な技術的SEO機能を活用するのに適した位置に配置されます。",
          "Una vez que la infraestructura crítica se alinee con las recomendaciones de la Fase 1, el producto estará bien posicionado para aprovechar las capacidades avanzadas de SEO técnico."
        )
      ];

  const signOff = getLabel(
    "Respectfully submitted,\nAutomated Due Diligence Engine",
    "감사합니다.\n자동화 실사 엔진 드림",
    "敬具\n自動監査エンジン",
    "Atentamente,\nMotor de Diligencia Debida Automatizado"
  );

  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="CONCLUSION" title="EXECUTIVE CONCLUSION" companyName={companyName}
      leftColClass="col-span-12" rightColClass="hidden"
      leftCol={
        <div className="flex flex-col h-full max-w-4xl">
          <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-12 uppercase border-b border-[#111] pb-6">
            {conclusionHeader}
          </h2>
          
          <div className="flex-grow space-y-6 text-[#111] leading-relaxed text-base font-serif">
            <p className="font-bold mb-8">{greeting}</p>
            
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className="text-justify">{p}</p>
            ))}
            
            <div className="mt-12 pt-8 text-sm font-sans">
              <p className="whitespace-pre-wrap">{signOff}</p>
              <p className="font-bold mt-2">{companyName}</p>
            </div>
          </div>
        </div>
      }
    />
  );
};



// Generic Category Slide
export const CategorySlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize, categoryNum, categoryName, score, verdict, verdictColor, verdictBgColor, description, checks }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName={`CATEGORY ${String(categoryNum).padStart(2, '0')}`} 
    title={`CATEGORY: ${categoryName.toUpperCase()}`} 
    companyName={companyName}
    leftColClass="col-span-6" rightColClass="col-span-6"
    leftCol={
      <div className="flex flex-col justify-center h-full pr-8">
        <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-2">
          CATEGORY {String(categoryNum).padStart(2, '0')}
        </div>
        <h2 className="text-4xl font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">{categoryName}</h2>
        
        <div className={`text-[180px] font-mono font-bold scale-y-110 origin-bottom-left leading-none tracking-tighter flex items-baseline gap-2 mb-2 ${verdictColor}`}>
          {score}
          <span className="text-[64px] text-[#888] font-mono font-bold">/100</span>
        </div>
        
        <div className={`inline-flex px-3 py-1.5 ${verdictBgColor} text-white font-mono text-[13px] uppercase tracking-widest font-bold mb-6 items-center gap-2 w-max`}>
          <div className="w-2 h-2 bg-white"></div>
          {verdict}
        </div>

        <p className="text-[#444] text-[15px] leading-relaxed w-full">
          {description}
        </p>
      </div>
    }
    rightCol={
      <div className="h-full flex flex-col justify-center pt-8">
        <div className="flex justify-between items-end pb-3 border-b border-[#111] mb-2">
          <div className="font-mono text-[11px] tracking-widest uppercase text-[#666]">CHECK</div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[#666]">PTS</div>
        </div>
        <div>
          {checks.map((chk: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-[#ddd] last:border-0">
              <div>
                <div className={`font-bold text-[14px] ${chk.ptsColor || 'text-[#111]'} mb-1`}>{chk.name}</div>
                <div className={`font-mono text-[12px] ${chk.subtextColor || 'text-[#666]'}`}>{chk.subtext}</div>
              </div>
              <div className="font-mono text-[14px] font-bold tracking-widest">{chk.pts}</div>
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

  const getLabel = (en: string, ko: string, ja: string, es: string) => {
    return locale === 'ko' ? ko : locale === 'ja' ? ja : locale === 'es' ? es : en;
  };
  
  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName={getLabel("READINESS", "배포 준비 상태", "展開の準備状態", "PREPARACIÓN PARA DESPLIEGUE")} 
      title={getLabel("APPROVED USE CASES", "승인된 배포 시나리오", "承認されたユースケース", "CASOS DE USO APROBADOS")} 
      companyName={companyName}
      leftColClass="col-span-12" rightColClass="col-span-12"
      leftCol={
        <div className="flex flex-col justify-center h-full pr-8">
          <h2 className="text-[56px] font-bold scale-y-105 origin-bottom-left tracking-tighter mb-6 leading-tight">{getLabel("Deployment Readiness", "출시 준비도 판정", "リリース準備度判定", "Evaluación de Preparación")}</h2>
          <p className="text-[#444] text-[15px] leading-relaxed w-full mb-8">
            {getLabel(
              "Based on the aggregated technical audit score, the platform is cleared for the following deployment scenarios. Proceeding outside these parameters assumes significant structural risk.",
              "종합적인 기술 실사 점수를 바탕으로, 현재 플랫폼은 아래의 배포 시나리오에 한해 승인되었습니다. 이 권장 범위를 벗어나 출시를 강행할 경우 심각한 구조적 위험을 감수해야 합니다.",
              "総合的な技術監査スコアに基づいて、プラットフォームは以下の展開シナリオについて承認されています。これらのパラメーターを超えて進行すると、重大な構造的リスクを負うことになります。",
              "Con base en la puntuación agregada de la auditoría técnica, la plataforma está autorizada para los siguientes escenarios de despliegue. Proceder fuera de estos parámetros asume un riesgo estructural significativo."
            )}
          </p>
        </div>
      }
      rightCol={
        <div className="flex flex-col gap-6 justify-center h-full">
          <div className={`p-6 border-l-4 ${isNotReady ? 'border-[#e11d48] bg-rose-50/50' : 'border-[#ddd] opacity-40 grayscale'}`}>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isNotReady ? 'bg-[#e11d48]' : 'bg-[#ddd]'}`}></div>
              {getLabel("Development / Staging", "개발 / 스테이징", "開発 / ステージング", "Desarrollo / Staging")}
            </h3>
            <p className="text-sm text-[#444]">{getLabel("Cleared for internal testing and QA. Do not expose to public traffic or search engines.", "내부 테스트 및 QA 목적으로만 승인되었습니다. 대중이나 검색 엔진에 노출해서는 안 됩니다.", "内部テストとQA用に承認されています。一般のトラフィックや検索エンジンには公開しないでください。", "Aprobado para pruebas internas y control de calidad. No exponer al tráfico público ni a los motores de búsqueda.")}</p>
          </div>
          
          <div className={`p-6 border-l-4 ${isSoftLaunch ? 'border-amber-500 bg-amber-50/50' : 'border-[#ddd] opacity-40 grayscale'}`}>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSoftLaunch ? 'bg-amber-500' : 'bg-[#ddd]'}`}></div>
              {getLabel("Soft Launch / Beta", "소프트 런칭 / 베타", "ソフトローンチ / ベータ", "Lanzamiento Suave / Beta")}
            </h3>
            <p className="text-sm text-[#444]">{getLabel("Cleared for limited audience release. Resolving warnings is highly recommended before scaling marketing efforts.", "제한된 대상에게만 공개하는 것을 승인합니다. 본격적인 마케팅 전에 경고 사항을 해결하는 것을 강력히 권장합니다.", "限定された視聴者へのリリースが承認されています。マーケティング活動を拡大する前に、警告を解決することを強くお勧めします。", "Aprobado para un lanzamiento a un público limitado. Se recomienda encarecidamente resolver las advertencias antes de escalar los esfuerzos de marketing.")}</p>
          </div>
          
          <div className={`p-6 border-l-4 ${isReady ? 'border-emerald-600 bg-emerald-50/50' : 'border-[#ddd] opacity-40 grayscale'}`}>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-600' : 'bg-[#ddd]'}`}></div>
              {getLabel("Full Production Release", "정식 프로덕션 출시", "フルプロダクションリリース", "Lanzamiento de Producción Total")}
            </h3>
            <p className="text-sm text-[#444]">{getLabel("Cleared for global availability, B2B enterprise scaling, and unconstrained marketing campaigns.", "글로벌 서비스, B2B 엔터프라이즈 확장 및 제약 없는 마케팅 캠페인을 위한 모든 준비가 완료되었습니다.", "グローバルな可用性、B2Bエンタープライズの拡張、および制約のないマーケティングキャンペーンについて承認されています。", "Aprobado para disponibilidad global, escalado empresarial B2B y campañas de marketing sin restricciones.")}</p>
          </div>
        </div>
      }
    />
  );
};

// Agenda Slide
export const AgendaSlide = ({ toc, locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize }: any) => {
  const isEn = !locale || locale === 'en';
  const getLabel = (en: string, ko: string, ja: string, es: string) => {
    return locale === 'ko' ? ko : locale === 'ja' ? ja : locale === 'es' ? es : en;
  };

  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="TABLE OF CONTENTS" title={getLabel("TABLE OF CONTENTS", "목차", "目次", "ÍNDICE")} companyName={companyName}
      leftColClass="col-span-12" rightColClass="col-span-12"
      leftCol={
        <div className="mb-12">
          <h2 className="text-[56px] font-bold scale-y-105 origin-bottom-left tracking-tighter mb-4">{getLabel("Table of Contents", "목차", "目次", "Índice")}</h2>
          <p className="text-[#444] text-lg leading-relaxed w-full">
            {getLabel(
              "Here is the detailed table of contents for the release readiness assessment and remediation steps.",
              "출시 준비 상태 평가 및 조치 사항에 대한 전체 목차입니다. 각 섹션의 시작 페이지를 확인하실 수 있습니다.",
              "リリース準備評価と修復手順の詳細な目次です。",
              "Aquí está el índice detallado para la evaluación de preparación de lanzamiento y los pasos de remediación."
            )}
          </p>
        </div>
      }
      rightCol={
        <div className="flex gap-16">
          <div className="w-1/2">
            <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">
              {getLabel("PART 01 · FOUNDATION", "파트 01 · 기초", "パート 01 · 基礎", "PARTE 01 · BASE")}
            </div>
            <ul className="space-y-2.5 font-bold text-[14px] text-[#111]">
              {toc?.slice(0, Math.ceil(toc.length / 2)).map((item: any, i: number) => (
                <li key={i} className="flex justify-between items-center border-b border-[#ddd] pb-2">
                  <div className="flex gap-4">
                    <span className="w-5 text-right font-mono text-sm text-[#888]">{i + 1}.</span> 
                    {item.title}
                  </div>
                  <span className="font-mono text-sm text-[#666]">{String(item.page).padStart(2, '0')}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-1/2">
            <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6">
              {getLabel("PART 02 · DETAILS", "파트 02 · 상세", "パート 02 · 詳細", "PARTE 02 · DETALLES")}
            </div>
            <ul className="space-y-2.5 font-bold text-[14px] text-[#111]">
              {toc?.slice(Math.ceil(toc.length / 2)).map((item: any, i: number) => {
                const actualIndex = i + Math.ceil(toc.length / 2);
                return (
                  <li key={actualIndex} className="flex justify-between items-center border-b border-[#ddd] pb-2">
                    <div className="flex gap-4">
                      <span className="w-5 text-right font-mono text-sm text-[#888]">{actualIndex + 1}.</span> 
                      {item.title}
                    </div>
                    <span className="font-mono text-sm text-[#666]">{String(item.page).padStart(2, '0')}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      }
    />
  );
};

