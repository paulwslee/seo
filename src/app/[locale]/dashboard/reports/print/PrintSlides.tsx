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
  <div className="flex justify-between items-end py-4 border-b border-[#ddd] last:border-0">
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
    <div className={`print-page mx-auto mb-12 shadow-2xl bg-[#f4f3ed] text-[#111111] p-12 flex flex-col relative page-break-after overflow-hidden box-border`} style={{ width, height }}>
      {/* Header */}
      <div className="flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest mb-16 shrink-0">
        <span>Release Readiness · {companyName}</span>
        <span>{String(pageNum).padStart(2, '0')} · {sectionName}</span>
      </div>

      {/* Main Body */}
      <div className={`flex-grow w-full ${isLandscape ? 'grid grid-cols-12 gap-16' : 'flex flex-col space-y-12'} pb-10`}>
        <div className={`${isLandscape ? leftColClass : 'w-full'} flex flex-col`}>
          {leftCol}
        </div>
        <div className={`${isLandscape ? rightColClass : 'w-full'} flex flex-col`}>
          {rightCol}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between font-mono text-[10px] text-[#666] uppercase tracking-widest bg-[#f4f3ed] pt-4 items-center">
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
    leftCol={
      <div>
        <div className="inline-block px-3 py-1 bg-[#e11d48] text-white font-mono text-xs uppercase tracking-widest font-bold mb-6">
          BLOCKER {String(index).padStart(2, '0')}
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">{blocker.title}</h2>
        <p className="text-[#444] text-sm leading-relaxed mb-6 max-w-sm">
          {blocker.description}
        </p>

        <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">SPEC FOR DEV TEAM</div>
        <div className="space-y-2">
          {blocker.spec?.map((step: string, i: number) => (
            <div key={i} className="flex gap-4 border-b border-[#ddd] pb-2">
              <div className="font-mono text-[10px] text-[#888] pt-0.5">{String(i + 1).padStart(2, '0')}</div>
              <div className="text-xs font-medium leading-relaxed">{step}</div>
            </div>
          ))}
        </div>
      </div>
    }
    rightCol={
      <div className="h-full flex flex-col justify-center">
        <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">VERIFICATION</div>
        <div className="bg-[#1a1b1e] text-[#f8f9fa] p-8 rounded-md font-mono text-xs leading-relaxed overflow-x-auto shadow-xl">
          <pre className="whitespace-pre-wrap">
            {blocker.verification_bash}
          </pre>
        </div>
      </div>
    }
  />
);

// Warning Slide
export const WarningSlide = ({ locale, orientation, pageNum, totalPages, companyName, warnings , evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="WARNINGS" title="WARNING-LEVEL FIXES" companyName={companyName}
    leftCol={
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">Warning-level fixes</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm">
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
        <div className="space-y-6">
          {warnings.map((w: any, i: number) => (
            <div key={i} className="flex text-sm border-b border-[#ddd] pb-4">
              <div className="w-1/4 pr-4">
                <div className="inline-block px-2 py-0.5 bg-amber-500 text-black font-mono text-[10px] uppercase font-bold mb-2">WARN</div>
                <div className="font-bold">{w.issue}</div>
              </div>
              <div className="w-1/2 pr-4 text-[#444] leading-relaxed text-xs">
                {w.spec}
              </div>
              <div className="w-1/4 font-mono text-xs text-[#666] break-all">
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
    leftCol={
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">Projected score trajectory</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm">
          {getSlideDesc(locale || 'en', 'trajectory', { score: currentScore })}
        </p>
      </div>
    }
    rightCol={
      <div className="flex flex-wrap gap-4 items-center justify-center h-full">
        <div className="p-6 bg-[#eae8e1] flex-1 min-w-[200px]">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">TODAY</div>
          <div className="text-6xl font-black text-[#e11d48] flex items-baseline gap-1 mb-4">
            {currentScore}<span className="text-xl text-[#888]">/100</span>
          </div>
          <div className="inline-block px-2 py-1 border border-[#e11d48] text-[#e11d48] font-mono text-[10px] uppercase tracking-widest font-bold">
            NOT READY
          </div>
        </div>
        
        {trajectory.map((t: any, i: number) => (
          <div key={i} className="p-6 border-l border-[#ddd] flex-1 min-w-[200px]">
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">{t.fix}</div>
            <div className="text-6xl font-black text-amber-500 flex items-baseline gap-1 mb-4">
              ~{t.projected_score}<span className="text-xl text-[#888]">/100</span>
            </div>
            <div className={`inline-block px-2 py-1 border font-mono text-[10px] uppercase tracking-widest font-bold ${t.projected_score >= 80 ? 'border-emerald-600 text-emerald-600' : 'border-amber-500 text-amber-500'}`}>
              {t.status}
            </div>
          </div>
        ))}
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
      <div className="flex flex-row gap-8 items-end justify-between border-b border-[#111] pb-4 mb-4">
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-2">AFTER REMEDIATION · AT SCALE</div>
          <h2 className="text-4xl font-black tracking-tighter">Architecture moves<br/>for 10K → 100K users</h2>
        </div>
        <div className="text-right">
          <p className="text-[#444] text-sm leading-relaxed max-w-md mb-2">
            {getSlideDesc(locale || 'en', 'roadmap1')}
          </p>
          <p className="font-mono text-xs text-[#888] leading-relaxed">
            {getSlideDesc(locale || 'en', 'roadmap2')}
          </p>
        </div>
      </div>
    }
    rightCol={
      <div className="flex gap-4">
        {roadmap.map((item: any, i: number) => (
          <div key={i} className="flex-1 bg-white p-6 shadow-sm border border-[#eee]">
            <div className="flex justify-between items-center mb-6">
              <div className="font-mono text-xs text-[#888]">{String(i + 1).padStart(2, '0')}</div>
              <div className={`font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 text-white ${item.priority === 'HIGH' ? 'bg-[#e11d48]' : 'bg-amber-500'}`}>{item.priority}</div>
            </div>
            <h3 className="font-bold text-lg mb-8 leading-tight">{item.title}</h3>
            
            <div className="space-y-4">
              <div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-[#888] mb-1">DRIVER</div>
                <p className="text-xs text-[#444] leading-relaxed">{item.driver}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-[#888] mb-1">SWAP</div>
                <p className="text-xs text-[#e11d48] line-through">{item.swap.split('->')[0]?.trim()}</p>
                <p className="text-xs text-emerald-600 font-bold">→ {item.swap.split('->')[1]?.trim()}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-[#888] mb-1">GAINS</div>
                <p className="text-xs text-[#444] leading-relaxed">{item.gains}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-[#888] mb-1">TRIGGER</div>
                <p className="font-mono text-[10px] text-[#111]">{item.trigger}</p>
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
    leftCol={
      <div>
        <div className={`inline-block px-3 py-1 font-mono text-xs uppercase tracking-widest font-bold mb-6 text-white ${coppa.is_exposed ? 'bg-[#e11d48]' : 'bg-emerald-600'}`}>
          {coppa.is_exposed ? 'US LAUNCH BLOCKER' : 'LOW RISK'}
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">COPPA exposure</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm mb-12">
          {coppa.reasoning}
        </p>
        
        <div className="font-mono text-[10px] tracking-widest uppercase text-[#666] mb-4">WHAT WE COLLECT TODAY</div>
        <ul className="list-disc ml-4 space-y-2 text-sm text-[#111] mb-8">
          {coppa.collected_data?.map((d: string, i: number) => <li key={i}>{d}</li>)}
        </ul>
        {coppa.is_exposed && (
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest">
            All categories qualify as "personal information" under COPPA §312.2.
          </p>
        )}
      </div>
    }
    rightCol={
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
    }
  />
);

// Industry Precedent Slide
export const IndustryPrecedentSlide = ({ locale, orientation, pageNum, totalPages, companyName, precedents , evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="INDUSTRY PRECEDENT" title="INDUSTRY PRECEDENT · CASE STUDIES" companyName={companyName}
    leftCol={
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">What the top platforms<br/>actually run on</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm">
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
    leftCol={
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">What we cannot assess<br/>without source</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm mb-12">
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
    leftCol={
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">Resolution requires<br/>qualified legal counsel</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm">
          {getSlideDesc(locale || 'en', 'legal')}
        </p>
      </div>
    }
    rightCol={
      <div className="flex gap-8 h-full items-start">
        <div className="flex-1 bg-white p-8 border border-[#ddd]">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#888] mb-2">STATUS</div>
          <h3 className="font-bold text-lg mb-4">{legal.status}</h3>
          
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#888] mb-2 mt-8">NOT IN SCOPE OF THIS ASSESSMENT</div>
          <ul className="list-disc ml-4 space-y-2 text-sm text-[#444]">
            <li>Choice of consent mechanism</li>
            <li>Liability allocation</li>
            <li>ToS / Privacy Policy drafting</li>
          </ul>
        </div>
        
        <div className="flex-1 bg-white p-8 border-t-4 border-emerald-600 shadow-sm">
          <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2 font-bold">RECOMMENDED NEXT STEP</div>
          <h3 className="font-bold text-lg mb-4">{legal.next_step}</h3>
          <p className="text-sm text-[#444] mb-4">Brief to bring to counsel:</p>
          <ul className="list-disc ml-4 space-y-2 text-sm text-[#444] mb-8">
            {legal.brief_points?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
          </ul>
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest">
            Engineering will implement whatever regime counsel defines.
          </p>
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
        <h2 className="text-4xl font-black tracking-tighter mb-6">AI Cursor / Copilot<br/>Remediation Prompt</h2>
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
    sectionName={t.page1Title.split('·')[1]?.trim() || "METHODOLOGY"} title={t.page1Title} companyName={companyName}
    leftCol={
      <div>
        <h2 className="text-4xl font-black tracking-tighter mb-6">{t.page1Title.split('·')[1]?.trim() || "Methodology & Scope"}</h2>
        <p className="text-[#444] text-sm leading-relaxed max-w-sm mb-6">
          <span className="font-bold">{t.methodValue}</span><br/><br/>
          {t.accessExplanation}
        </p>
      </div>
    }
    rightCol={
      <div className="space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">TRACK 1</div>
          <h3 className="font-bold text-lg mb-2">{t.track1}</h3>
          <p className="text-sm text-[#444] leading-relaxed">{t.track1Desc}</p>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">TRACK 2</div>
          <h3 className="font-bold text-lg mb-2">{t.track2}</h3>
          <p className="text-sm text-[#444] leading-relaxed">{t.track2Desc}</p>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">TRACK 3</div>
          <h3 className="font-bold text-lg mb-2">{t.track3}</h3>
          <p className="text-sm text-[#444] leading-relaxed">{t.track3Desc}</p>
        </div>
      </div>
    }
  />
);

// Glossary Slide
export const GlossarySlide = ({ locale, orientation, pageNum, totalPages, companyName, glossary, evidenceHash, paperSize }: any) => (
  <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
    sectionName="GLOSSARY" title="APPENDIX · GLOSSARY OF TERMS" companyName={companyName}
    leftColClass="col-span-12" rightColClass="col-span-12"
    leftCol={
      <div className="flex flex-col h-full">
        <h2 className="text-4xl font-black tracking-tighter mb-12 uppercase">Glossary</h2>
        <div className="grid grid-cols-2 gap-x-16 gap-y-8 max-w-5xl">
          {glossary.map((g: any, i: number) => (
            <div key={i} className="border-t border-[#ddd] pt-4">
              <h4 className="text-sm font-bold font-mono tracking-wider mb-2 text-[#e11d48]">{g.term}</h4>
              <p className="text-sm text-[#444] leading-relaxed">{g.definition}</p>
            </div>
          ))}
        </div>
      </div>
    }
  />
);
