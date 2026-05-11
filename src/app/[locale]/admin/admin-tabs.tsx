"use client";

import { useState } from "react";
import { Settings, Users, Activity, Loader2, Clock } from "lucide-react";
import { updateSystemConfig, updateUserPlan } from "./actions";

export function AdminTabs({ initialUsers, initialLogs, initialConfigs }: any) {
  const [activeTab, setActiveTab] = useState("models");
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState(initialUsers);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Model settings
  const defaultModelConfig = initialConfigs.find((c: any) => c.key === "DEFAULT_AI_MODEL");
  const [selectedModel, setSelectedModel] = useState(defaultModelConfig?.value || "gemini-2.5-flash");

  // Summarize logs
  const totalCalls = initialLogs.length;
  const totalDuration = initialLogs.reduce((acc: number, log: any) => acc + log.durationMs, 0);
  const globalTokens = initialLogs.reduce((acc: number, log: any) => acc + (log.promptTokens || 0) + (log.completionTokens || 0), 0);
  const globalCost = initialLogs.reduce((acc: number, log: any) => acc + (log.estimatedCost || 0), 0);
  
  // App Factory Summary
  const logsByService = initialLogs.reduce((acc: any, log: any) => {
    if (!acc[log.serviceName]) {
      acc[log.serviceName] = { calls: 0, duration: 0, cost: 0, tokens: 0 };
    }
    acc[log.serviceName].calls += 1;
    acc[log.serviceName].duration += log.durationMs;
    acc[log.serviceName].cost += (log.estimatedCost || 0);
    acc[log.serviceName].tokens += (log.promptTokens || 0) + (log.completionTokens || 0);
    return acc;
  }, {});

  const handleSaveModel = async () => {
    setLoading(true);
    await updateSystemConfig("DEFAULT_AI_MODEL", selectedModel, "Primary AI model for all generations");
    setLoading(false);
    alert("Model updated successfully!");
  };

  const handleTogglePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === "free" ? "premium" : "free";
    await updateUserPlan(userId, newPlan);
    setUsersList(usersList.map((u: any) => u.id === userId ? { ...u, plan: newPlan } : u));
  };

  let detailContent = null;
  if (selectedService) {
    const serviceLogs = initialLogs.filter((l: any) => l.serviceName === selectedService);
    const srvTotalCalls = serviceLogs.length;
    const srvTotalDuration = serviceLogs.reduce((acc: number, log: any) => acc + log.durationMs, 0);
    const srvTotalCost = serviceLogs.reduce((acc: number, log: any) => acc + (log.estimatedCost || 0), 0);
    const srvTotalTokens = serviceLogs.reduce((acc: number, log: any) => acc + (log.promptTokens || 0) + (log.completionTokens || 0), 0);
    
    const logsByModel = serviceLogs.reduce((acc: any, log: any) => {
      const model = log.modelName || 'Unknown';
      if (!acc[model]) acc[model] = { calls: 0, duration: 0 };
      acc[model].calls += 1;
      acc[model].duration += log.durationMs;
      return acc;
    }, {});

    const logsByPrompt = serviceLogs.reduce((acc: any, log: any) => {
      const prompt = log.promptType || 'Unknown';
      if (!acc[prompt]) acc[prompt] = { calls: 0, duration: 0 };
      acc[prompt].calls += 1;
      acc[prompt].duration += log.durationMs;
      return acc;
    }, {});

    detailContent = (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <button 
            onClick={() => setSelectedService(null)}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-bold">{selectedService} <span className="text-muted-foreground font-normal text-lg">Details</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground font-semibold mb-1">Total Calls</p>
            <h3 className="text-2xl font-extrabold text-indigo-500">{srvTotalCalls.toLocaleString()}</h3>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground font-semibold mb-1">Total Tokens</p>
            <h3 className="text-2xl font-extrabold text-emerald-500">{srvTotalTokens.toLocaleString()}</h3>
          </div>
          <div className="bg-gradient-to-br from-rose-500/5 to-transparent border border-rose-500/20 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground font-semibold mb-1">Total Cost</p>
            <h3 className="text-2xl font-extrabold text-rose-500">${(srvTotalCost / 1000000).toFixed(4)}</h3>
          </div>
          <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground font-semibold mb-1">Compute Time</p>
            <h3 className="text-2xl font-extrabold text-amber-500">{(srvTotalDuration / 1000).toFixed(1)}s</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Usage by AI Model</h3>
            <div className="space-y-2">
              {Object.keys(logsByModel).map(model => (
                <div key={model} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg border border-border/50">
                  <span className="font-medium text-sm">{model}</span>
                  <span className="text-sm text-muted-foreground">{logsByModel[model].calls} calls</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Usage by Prompt Type</h3>
            <div className="space-y-2">
              {Object.keys(logsByPrompt).map(prompt => (
                <div key={prompt} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg border border-border/50">
                  <span className="font-medium text-sm">{prompt}</span>
                  <span className="text-sm text-muted-foreground">{logsByPrompt[prompt].calls} calls</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- DONGUIBOGAM STYLE DETAILED LOGS TABLE --- */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> 
            Detailed Task History
          </h3>
          <div className="bg-background border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4">Request Time</th>
                    <th className="px-6 py-4">Task Type</th>
                    <th className="px-6 py-4">Target (URL/Text)</th>
                    <th className="px-6 py-4 text-right">Model</th>
                    <th className="px-6 py-4 text-right">Used Tokens (In/Out)</th>
                    <th className="px-6 py-4 text-right">Est. Cost</th>
                    <th className="px-6 py-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {serviceLogs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100).map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(log.createdAt).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs px-2.5 py-1.5 rounded-md font-semibold">
                          {log.promptType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.targetId ? (
                          <div className="font-semibold text-foreground text-sm max-w-xs truncate" title={log.targetId}>
                            {log.targetId}
                          </div>
                        ) : (
                          <div className="font-mono text-xs text-muted-foreground">-</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        <span className="text-xs bg-muted border border-border/50 rounded px-1.5 py-0.5 max-w-[120px] truncate" title={log.modelName || 'Unknown'}>
                          {log.modelName || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-foreground">{(log.promptTokens + log.completionTokens).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <span className="text-blue-500">In {log.promptTokens?.toLocaleString()}</span> 
                          <span className="mx-1 text-border/50">|</span> 
                          <span className="text-purple-500">Out {log.completionTokens?.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-rose-500">${((log.estimatedCost || 0) / 1000000).toFixed(5)}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5">
                          {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {serviceLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        No detailed logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Modern Segmented Control Tabs */}
      <div className="inline-flex mx-auto w-max items-center bg-muted/40 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md shadow-inner">
        <button 
          onClick={() => setActiveTab("models")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "models" ? "bg-background shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] text-emerald-600 border border-border/60 scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
        >
          <Settings className="w-4 h-4" /> Model Settings
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "users" ? "bg-background shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] text-indigo-600 border border-border/60 scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>
        <button 
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "api" ? "bg-background shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] text-orange-600 border border-border/60 scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
        >
          <Activity className="w-4 h-4" /> API Analytics
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 min-h-[500px] shadow-lg shadow-black/5">
        
        {/* Tab: Models */}
        {activeTab === "models" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold border-b border-border pb-4">AI Model Settings & Cost Predictor</h2>
            
            <div className="grid gap-6">
              <div className="flex flex-col gap-3 w-full">
                <label className="text-sm font-bold text-foreground">Active Model</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full max-w-md p-3.5 bg-background text-foreground border border-border/80 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm block"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast, Low Cost)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>
                </select>
                <button 
                  onClick={handleSaveModel}
                  disabled={loading}
                  className="mt-4 bg-foreground text-background font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 hover:-translate-y-0.5 flex items-center justify-center md:justify-start gap-2 max-w-md w-full transition-all shadow-md"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Settings
                </button>
              </div>

              <div className="bg-gradient-to-br from-muted/50 to-muted/10 p-6 md:p-8 rounded-2xl border border-border/50 space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" /> Cost Simulator
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <div className="bg-background/80 backdrop-blur-sm p-5 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Cost per 1M Tokens</p>
                    <p className="font-mono text-xl font-bold">{selectedModel.includes("flash") ? "$0.075" : "$1.25"}</p>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm p-5 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Scan Cost</p>
                    <p className="font-mono text-xl font-bold text-emerald-500">{selectedModel.includes("flash") ? "~$0.00015" : "~$0.0025"}</p>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm p-5 rounded-xl border border-border/50 shadow-sm sm:col-span-2 md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Margin on $9.99 Premium (100 Scans)</p>
                    <p className="font-mono text-xl font-bold text-indigo-500">
                      {selectedModel.includes("flash") ? "$9.97 (99.8%)" : "$9.74 (97.5%)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Users */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-300 w-full">
            <h2 className="text-2xl font-bold border-b border-border pb-4">User Management</h2>
            <div className="overflow-x-auto w-full bg-background/50 rounded-xl border border-border/50">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20 text-sm text-muted-foreground">
                    <th className="py-4 px-6 font-semibold">Email</th>
                    <th className="py-4 px-6 font-semibold">Joined</th>
                    <th className="py-4 px-6 font-semibold">Plan</th>
                    <th className="py-4 px-6 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6 font-medium">{u.email}</td>
                      <td className="py-4 px-6 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.plan === 'premium' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border/50'}`}>
                          {u.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleTogglePlan(u.id, u.plan)}
                          className="text-xs font-semibold border border-border bg-background shadow-sm hover:bg-foreground hover:text-background px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
                        >
                          Toggle Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-muted-foreground">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: API Analytics */}
        {activeTab === "api" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {!selectedService ? (
              <>
                <h2 className="text-2xl font-bold border-b border-border pb-4">App Factory Global Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-500/10 rounded-md"><Activity className="w-4 h-4 text-indigo-500" /></div>
                  <p className="text-xs text-muted-foreground font-semibold">Total API Calls</p>
                </div>
                <h3 className="text-2xl font-extrabold mt-2">{totalCalls.toLocaleString()}</h3>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-md"><Activity className="w-4 h-4 text-emerald-500" /></div>
                  <p className="text-xs text-muted-foreground font-semibold">Total Tokens</p>
                </div>
                <h3 className="text-2xl font-extrabold mt-2 text-emerald-500">{globalTokens.toLocaleString()}</h3>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-rose-500/10 rounded-md"><Activity className="w-4 h-4 text-rose-500" /></div>
                  <p className="text-xs text-muted-foreground font-semibold">Total API Cost</p>
                </div>
                <h3 className="text-2xl font-extrabold mt-2 text-rose-500">${(globalCost / 1000000).toFixed(4)}</h3>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-md"><Clock className="w-4 h-4 text-amber-500" /></div>
                  <p className="text-xs text-muted-foreground font-semibold">Total Compute</p>
                </div>
                <h3 className="text-2xl font-extrabold mt-2 text-amber-500">{(totalDuration / 1000).toFixed(1)}s</h3>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Usage by Service</h3>
              <div className="space-y-3">
                {Object.keys(logsByService).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No API usage recorded yet.</p>
                ) : (
                  Object.keys(logsByService).map(service => (
                      <div 
                        key={service} 
                        onClick={() => setSelectedService(service)}
                        className="flex justify-between items-center p-4 bg-muted/30 hover:bg-muted/60 rounded-lg border border-border cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground group-hover:text-indigo-500 transition-colors">{service}</span>
                          <span className="text-xs px-2 py-1 bg-background border border-border rounded-md text-muted-foreground">View Details &rarr;</span>
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <span><strong className="text-foreground">{logsByService[service].calls}</strong> calls</span>
                          <span><strong className="text-foreground">{logsByService[service].tokens.toLocaleString()}</strong> tokens</span>
                          <span><strong className="text-rose-500">${(logsByService[service].cost / 1000000).toFixed(4)}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
            ) : detailContent}
          </div>
        )}
      </div>
    </div>
  );
}
