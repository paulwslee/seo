import sys

file_path = 'src/app/[locale]/dashboard/reports/print/PrintSlides.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add English
content = content.replace('    hash: "This report\\'s underlying raw technical data was cryptographically sealed at the time of scanning. Alteration of the original telemetry will invalidate this SHA-256 fingerprint."\n  },',
'''    hash: "This report\\'s underlying raw technical data was cryptographically sealed at the time of scanning. Alteration of the original telemetry will invalidate this SHA-256 fingerprint.",
    agendaTitle: "Today's agenda",
    agendaSubtitle: "Walk through the release readiness assessment, then discuss the MSP partner proposal and next steps.",
    part1: "PART 01 · ASSESSMENT",
    a1: "1. Method & scope",
    a2: "2. Overall verdict",
    a3: "3. Score interpretation",
    a4: "4. Category breakdown",
    a4sub: "Performance · Security · Accessibility · Infrastructure · Content",
    a5: "5. Release readiness by use case",
    part2: "PART 02 · REMEDIATION",
    a6: "6. Critical blockers",
    a7: "7. Warnings & verification cadence",
    a8: "8. Projected score trajectory",
    a9: "9. COPPA exposure & legal next step",
    a10: "10. Appendix · what we cannot assess"
  },''')

# 2. Add Korean
content = content.replace('    hash: "이 보고서의 기본 기술 데이터는 스캔 당시 암호화되어 봉인되었습니다. 원본 원격 측정 데이터를 임의로 변경하면 이 SHA-256 지문이 무효화됩니다."\n  },',
'''    hash: "이 보고서의 기본 기술 데이터는 스캔 당시 암호화되어 봉인되었습니다. 원본 원격 측정 데이터를 임의로 변경하면 이 SHA-256 지문이 무효화됩니다.",
    agendaTitle: "오늘의 어젠다",
    agendaSubtitle: "출시 준비도 평가(Release Readiness Assessment)를 검토하고, 핵심 수정 사항과 다음 단계를 논의합니다.",
    part1: "PART 01 · 평가(ASSESSMENT)",
    a1: "1. 방법론 및 범위",
    a2: "2. 종합 판정 결과",
    a3: "3. 점수 해석 기준",
    a4: "4. 카테고리별 세부 분석",
    a4sub: "퍼포먼스 · 보안 · 접근성 · 인프라 · 콘텐츠",
    a5: "5. 서비스 환경별 출시 준비도",
    part2: "PART 02 · 해결 방안(REMEDIATION)",
    a6: "6. 치명적 블로커(Blockers)",
    a7: "7. 경고 수준 문제 및 검증 주기",
    a8: "8. 예상 점수 상승 궤적",
    a9: "9. 법적 노출(COPPA) 및 다음 단계",
    a10: "10. 부록 · 외부 감사의 한계"
  },''')

# 3. Add Japanese
content = content.replace('    hash: "このレポートの基礎となる生技術データは、スキャン時に暗号化されて封印されました。元のテレメトリデータを改ざんすると、このSHA-256フィンガープリントは無効になります。"\n  },',
'''    hash: "このレポートの基礎となる生技術データは、スキャン時に暗号化されて封印されました。元のテレメトリデータを改ざんすると、このSHA-256フィンガープリントは無効になります。",
    agendaTitle: "本日のアジェンダ",
    agendaSubtitle: "リリース準備度評価を確認し、修正事項と次のステップについて議論します。",
    part1: "PART 01 · 評価(ASSESSMENT)",
    a1: "1. 監査手法と範囲",
    a2: "2. 総合判定結果",
    a3: "3. スコアの解釈",
    a4: "4. カテゴリ別分析",
    a4sub: "パフォーマンス · セキュリティ · アクセシビリティ · インフラ · コンテンツ",
    a5: "5. ユースケース別の準備度",
    part2: "PART 02 · 改善策(REMEDIATION)",
    a6: "6. 致命的なブロッカー",
    a7: "7. 警告と検証サイクル",
    a8: "8. 予想されるスコアの推移",
    a9: "9. 法的リスク(COPPA)と次のステップ",
    a10: "10. 付録 · 外部監査の限界"
  },''')

# 4. Add Spanish
content = content.replace('    hash: "Los datos técnicos brutos subyacentes de este informe fueron sellados criptográficamente en el momento del escaneo. La alteración de la telemetría original invalidará esta huella SHA-256."\n  }',
'''    hash: "Los datos técnicos brutos subyacentes de este informe fueron sellados criptográficamente en el momento del escaneo. La alteración de la telemetría original invalidará esta huella SHA-256.",
    agendaTitle: "Agenda de Hoy",
    agendaSubtitle: "Revisar la evaluación de preparación para el lanzamiento, y luego discutir las soluciones y los próximos pasos.",
    part1: "PARTE 01 · EVALUACIÓN",
    a1: "1. Método y alcance",
    a2: "2. Veredicto general",
    a3: "3. Interpretación de la puntuación",
    a4: "4. Desglose por categorías",
    a4sub: "Rendimiento · Seguridad · Accesibilidad · Infraestructura · Contenido",
    a5: "5. Preparación por caso de uso",
    part2: "PARTE 02 · CORRECCIÓN",
    a6: "6. Bloqueadores críticos",
    a7: "7. Advertencias y cadencia de verificación",
    a8: "8. Trayectoria de puntuación proyectada",
    a9: "9. Exposición a COPPA y próximos pasos",
    a10: "10. Apéndice · Lo que no podemos evaluar"
  }''')


agenda_component = '''
// Agenda Slide
export const AgendaSlide = ({ locale, orientation, pageNum, totalPages, companyName, evidenceHash, paperSize }: any) => {
  const getTrans = (key: string) => getSlideDesc(locale || 'en', key as any);
  
  return (
    <Slide locale={locale} orientation={orientation} pageNum={pageNum} totalPages={totalPages} evidenceHash={evidenceHash} paperSize={paperSize}
      sectionName="AGENDA" title="TODAY'S AGENDA" companyName={companyName}
      leftColClass="col-span-12" rightColClass="hidden"
      leftCol={
        <div className="flex flex-col h-full w-full">
          <div className="mb-16">
            <h2 className="text-[52px] font-black tracking-tighter mb-4 leading-tight">{getTrans('agendaTitle')}</h2>
            <p className="text-[#444] text-sm max-w-2xl leading-relaxed">
              {getTrans('agendaSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-20">
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6 border-b border-[#ddd] pb-3">{getTrans('part1')}</div>
              <ul className="space-y-4 text-[15px] font-medium text-[#222]">
                <li>{getTrans('a1')}</li>
                <li>{getTrans('a2')}</li>
                <li>{getTrans('a3')}</li>
                <li>
                  {getTrans('a4')}
                  <div className="text-[13px] text-[#888] font-normal mt-1.5 ml-4">{getTrans('a4sub')}</div>
                </li>
                <li>{getTrans('a5')}</li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase text-[#666] mb-6 border-b border-[#ddd] pb-3">{getTrans('part2')}</div>
              <ul className="space-y-4 text-[15px] font-medium text-[#222]">
                <li>{getTrans('a6')}</li>
                <li>{getTrans('a7')}</li>
                <li>{getTrans('a8')}</li>
                <li>{getTrans('a9')}</li>
                <li>{getTrans('a10')}</li>
              </ul>
            </div>
          </div>
        </div>
      }
      rightCol={<></>}
    />
  );
};

// Blocker Slide
'''

content = content.replace("// Blocker Slide\n", agenda_component)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
