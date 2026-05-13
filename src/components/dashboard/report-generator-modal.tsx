"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Printer, Building2, Calendar, Globe, Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ReportGeneratorModal({ 
  projects, 
  currentProjectUrl,
  userProfile
}: { 
  projects: any[],
  currentProjectUrl?: string,
  userProfile?: { companyName?: string | null, whiteLabelLogo?: string | null }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState(userProfile?.companyName || "");
  const [logoPreview, setLogoPreview] = useState(userProfile?.whiteLabelLogo ? "/api/user/logo" : null);
  const [selectedDomain, setSelectedDomain] = useState(currentProjectUrl || (projects[0]?.url || ""));
  const [template, setTemplate] = useState("full");
  const [includeVibe, setIncludeVibe] = useState(false);
  const [paperSize, setPaperSize] = useState("a4");
  const [orientation, setOrientation] = useState("landscape");
  const [dateRange, setDateRange] = useState("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/logo", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Cache bust the image
        setLogoPreview(`/api/user/logo?t=${Date.now()}`);
      } else {
        alert("Failed to upload logo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfileAndPrint = async () => {
    if (companyName !== userProfile?.companyName) {
      await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });
    }

    // Open dedicated print page in a new tab
    const url = `/dashboard/reports/print?domain=${encodeURIComponent(selectedDomain)}&template=${template}&paper=${paperSize}&orientation=${orientation}&vibe=${includeVibe}${dateRange ? `&date=${dateRange}` : ''}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm transition-all outline-none select-none h-8 px-2.5 flex gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold border-0 shadow-md">
        <FileText className="w-4 h-4" />
        Advanced Report
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] print:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> 
            Report Generator
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          
          {/* White-Labeling Section */}
          <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/30">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" /> White-Label Settings (Premium)
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agency / Company Name</Label>
                <Input 
                  placeholder="e.g. Acme Marketing" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Logo</Label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? "Uploading..." : <><Upload className="w-4 h-4 mr-2" /> Upload Logo</>}
                  </Button>
                </div>
                {logoPreview && (
                  <div className="mt-2 flex items-center justify-center p-2 bg-white rounded-md border">
                    <img src={logoPreview} alt="Company Logo" className="max-h-8 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Target Domain</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => {
                    let hostname = p.url;
                    try {
                      hostname = new URL(p.url).hostname;
                    } catch (e) {}
                    return <SelectItem key={p.id} value={p.url}>{hostname}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Layers className="w-4 h-4" /> Report Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Pitch Deck</SelectItem>
                    <SelectItem value="executive">Executive 1-Pager</SelectItem>
                    <SelectItem value="jira">Developer Jira Board</SelectItem>
                    <SelectItem value="legal">Legal & Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Date Filter</Label>
                <Input 
                  type="date" 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="Select Date (Optional)" 
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paper Size</Label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (Standard KR/EU)</SelectItem>
                    <SelectItem value="letter">Letter (Standard US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape (가로형)</SelectItem>
                    <SelectItem value="portrait">Portrait (세로형)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>


          {/* Premium Options */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/30 bg-indigo-50/50">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-indigo-900 flex items-center gap-2">
                👑 [PRO] Vibe Coding Handoff
              </Label>
              <p className="text-xs text-indigo-700">Include copy-pasteable AI prompt for Cursor/Copilot</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={includeVibe} onChange={(e) => setIncludeVibe(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <Button 
            onClick={handleSaveProfileAndPrint} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 text-lg mt-2"
          >
            <Printer className="w-5 h-5 mr-2" />
            Generate & Print PDF
          </Button>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
