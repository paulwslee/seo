"use client";

import { Download } from "lucide-react";

export function PdfExportButton({ targetId, filename }: { targetId: string, filename: string }) {
  const handleExport = () => {
    // 1. Save original title
    const originalTitle = document.title;
    // 2. Set title to desired PDF filename (browser uses this for the default save name)
    document.title = filename;
    
    // 3. Trigger native print dialog (which generates a perfect, text-selectable PDF)
    window.print();
    
    // 4. Restore title
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl transition-all hover:shadow-md cursor-pointer text-sm"
    >
      <Download className="w-4 h-4" />
      Print / Save as PDF
    </button>
  );
}
