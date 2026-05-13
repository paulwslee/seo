import re

file_path = 'src/app/[locale]/dashboard/reports/print/PrintSlides.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will append CategorySlide, ReadinessUseCaseSlide, AgendaSlide, and ConclusionSlide if they don't exist.

extra_code = """
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

// Agenda Slide
export const AgendaSlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize }: any) => {
  const isEn = !locale || locale === 'en';
  const getLabel = (en: string, ko: string, ja: string, es: string) => {
    return locale === 'ko' ? ko : locale === 'ja' ? ja : locale === 'es' ? es : en;
  };

  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="AGENDA" title={getLabel("TODAY'S AGENDA", "오늘의 진행 순서", "本日の進行順序", "AGENDA DE HOY")} companyName={companyName}
      leftColClass="col-span-12" rightColClass="col-span-12"
      leftCol={
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-6">{getLabel("Today's Agenda", "오늘의 진행 순서", "本日の進行順序", "Agenda de hoy")}</h2>
          <p className="text-[#444] text-sm leading-relaxed max-w-sm mb-6">
            {getLabel(
              "A comprehensive review of the target surface, covering methodology, executive summary, and deep technical insights.",
              "대상 표면의 방법론, 요약 및 심층 기술 실사 지표를 아우르는 포괄적인 검토입니다.",
              "ターゲット表面の方法論、エグゼクティブサマリー、および詳細な技術的洞察を網羅する包括的なレビューです。",
              "Una revisión integral de la superficie objetivo, que cubre metodología, resumen ejecutivo y profundos conocimientos técnicos."
            )}
          </p>
        </div>
      }
      rightCol={
        <div className="space-y-6">
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">01. EXECUTIVE</div>
            <h3 className="font-bold text-lg mb-2">{getLabel("Executive Summary", "경영진 요약", "エグゼクティブサマリー", "Resumen Ejecutivo")}</h3>
            <p className="text-sm text-[#444] leading-relaxed">
              {getLabel("Overall verdict and top-level findings.", "전반적인 판정 및 주요 결과.", "全体的な判定と主要な結果。", "Veredicto general y hallazgos principales.")}
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">02. TECHNICAL AUDIT</div>
            <h3 className="font-bold text-lg mb-2">{getLabel("Technical Due Diligence", "기술 실사", "技術監査", "Auditoría Técnica")}</h3>
            <p className="text-sm text-[#444] leading-relaxed">
              {getLabel("In-depth analysis of infrastructure, security, performance, and accessibility.", "인프라, 보안, 성능 및 접근성에 대한 심층 분석.", "インフラストラクチャ、セキュリティ、パフォーマンス、およびアクセシビリティの詳細な分析。", "Análisis en profundidad de infraestructura, seguridad, rendimiento y accesibilidad.")}
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-emerald-600 mb-2">03. STRATEGY</div>
            <h3 className="font-bold text-lg mb-2">{getLabel("Remediation Roadmap", "조치 로드맵", "修復ロードマップ", "Hoja de ruta de remediación")}</h3>
            <p className="text-sm text-[#444] leading-relaxed">
              {getLabel("Actionable steps to resolve identified issues.", "식별된 문제를 해결하기 위한 실행 가능한 단계.", "特定された問題を解決するための実行可能なステップ。", "Pasos accionables para resolver los problemas identificados.")}
            </p>
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
    ? executiveSummary.split('\\n\\n').filter((p: string) => p.trim().length > 0)
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
    "Respectfully submitted,\\nAutomated Due Diligence Engine",
    "감사합니다.\\n자동화 실사 엔진 드림",
    "敬具\\n自動監査エンジン",
    "Atentamente,\\nMotor de Diligencia Debida Automatizado"
  );

  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="CONCLUSION" title="EXECUTIVE CONCLUSION" companyName={companyName}
      leftColClass="col-span-12" rightColClass="hidden"
      leftCol={
        <div className="flex flex-col h-full max-w-4xl">
          <h2 className="text-4xl font-black tracking-tighter mb-12 uppercase border-b border-[#111] pb-6">
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
"""

if 'export const CategorySlide' not in content:
    content += '\n\n' + extra_code

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Slides appended!")
