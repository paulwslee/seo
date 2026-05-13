import sys

file_path = 'src/app/[locale]/dashboard/reports/print/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

ja_es_translations = """
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
      page1Title: "01 · 手法と範囲",
      track1: "フロントエンド",
      track1Desc: "レンダリングされたHTML、メタタグ、セマンティック構造、アクセシビリティARIA属性、ビューポートディレクティブ、モバイルズームポリシーの分析。クライアント側のDOMの整合性を評価します。",
      track2: "バックエンドおよびインフラ",
      track2Desc: "TLS、セキュリティ応答ヘッダー(HSTS、CSP)、CORSポリシー、リダイレクトチェーン、DNS構成、エッジCDN識別、キャッシュポリシー、電子メール認証(SPF/DMARC)の検査。",
      track3: "パフォーマンス",
      track3Desc: "ページサイズ、フォントの読み込み、CSS/JSのレンダリングブロック、画像の最適化(Next/Imageとネイティブ)、TTFB、HTTP/2の多重化、Core Web Vitalsの測定。",
      page2Title: "02 · 総合判定結果",
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
      page3Title: "03 · カテゴリ：パフォーマンス",
      page4Title: "04 · セキュリティとインフラ",
      page5Title: "05 · 致命的な問題とアクションプラン",
      page6Title: "06 · COPPAおよびプライバシーの露出",
      appendixTitle: "付録 · 外部評価の限界",
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
      page1Title: "01 · Método y Alcance",
      track1: "Frontend",
      track1Desc: "Análisis de HTML renderizado, metaetiquetas, estructura semántica, atributos ARIA de accesibilidad, directivas de ventana gráfica y políticas de zoom móvil. Evalúa la integridad del DOM del lado del cliente.",
      track2: "Backend e Infraestructura",
      track2Desc: "Inspección de TLS, encabezados de respuesta de seguridad (HSTS, CSP), políticas de CORS, cadenas de redireccionamiento, configuraciones de DNS, identificación de CDN de borde, políticas de almacenamiento en caché y autenticación de correo electrónico (SPF/DMARC).",
      track3: "Rendimiento",
      track3Desc: "Medición del peso de la página, carga de fuentes, entrega de bloqueo de renderizado de CSS/JS, optimización de imágenes (Next/Image vs nativo), TTFB, multiplexación HTTP/2 y Core Web Vitals.",
      page2Title: "02 · Veredicto General",
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
      page3Title: "03 · Categoría: Rendimiento",
      page4Title: "04 · Seguridad e Infraestructura",
      page5Title: "05 · Problemas Críticos y Plan de Acción",
      page6Title: "06 · COPPA y Exposición de Privacidad",
      appendixTitle: "Apéndice · Límites de Evaluación",
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
  return {"""

content = content.replace("  }\n  return {", ja_es_translations)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Translations inserted!")
