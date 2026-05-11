"use client";

import { useState } from "react";
import { Settings, Users, Activity, Loader2, Clock } from "lucide-react";
import { updateSystemConfig, updateUserPlan } from "./actions";

export function AdminTabs({ initialUsers, initialLogs, initialConfigs }: any) {
  const [activeTab, setActiveTab] = useState("models");
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState(initialUsers);

  // Model settings
  const defaultModelConfig = initialConfigs.find((c: any) => c.key === "DEFAULT_AI_MODEL");
  const [selectedModel, setSelectedModel] = useState(defaultModelConfig?.value || "gemini-2.5-flash");

  // Summarize logs
  const totalCalls = initialLogs.length;
  const totalDuration = initialLogs.reduce((acc: number, log: any) => acc + log.durationMs, 0);
  
  // App Factory Summary
  const logsByService = initialLogs.reduce((acc: any, log: any) => {
    if (!acc[log.serviceName]) {
      acc[log.serviceName] = { calls: 0, duration: 0 };
    }
    acc[log.serviceName].calls += 1;
    acc[log.serviceName].duration += log.durationMs;
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

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab("models")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "models" ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-muted text-muted-foreground"}`}
        >
          <Settings className="w-5 h-5" /> Model Settings
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "users" ? "bg-indigo-500/10 text-indigo-500" : "hover:bg-muted text-muted-foreground"}`}
        >
          <Users className="w-5 h-5" /> User Management
        </button>
        <button 
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "api" ? "bg-orange-500/10 text-orange-500" : "hover:bg-muted text-muted-foreground"}`}
        >
          <Activity className="w-5 h-5" /> API Analytics
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 min-h-[500px] shadow-lg shadow-black/5">
        
        {/* Tab: Models */}
        {activeTab === "models" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold border-b border-border pb-4">AI Model Settings & Cost Predictor</h2>
            
            <div className="grid gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground">Active Model</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full max-w-md p-3 bg-background border border-border rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast, Low Cost)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning, High Cost)</option>
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
            <h2 className="text-2xl font-bold border-b border-border pb-4">App Factory Global Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg"><Activity className="w-5 h-5 text-indigo-500" /></div>
                  <p className="text-sm text-muted-foreground font-semibold">Total Global API Calls</p>
                </div>
                <h3 className="text-4xl font-extrabold mt-4">{totalCalls.toLocaleString()}</h3>
              </div>
              <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg"><Clock className="w-5 h-5 text-emerald-500" /></div>
                  <p className="text-sm text-muted-foreground font-semibold">Total Compute Duration</p>
                </div>
                <h3 className="text-4xl font-extrabold mt-4 text-emerald-500">{(totalDuration / 1000).toFixed(1)}s</h3>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Usage by Service</h3>
              <div className="space-y-3">
                {Object.keys(logsByService).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No API usage recorded yet.</p>
                ) : (
                  Object.keys(logsByService).map(service => (
                    <div key={service} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border border-border">
                      <span className="font-medium text-foreground">{service}</span>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span><strong className="text-foreground">{logsByService[service].calls}</strong> calls</span>
                        <span><strong className="text-foreground">{(logsByService[service].duration / 1000).toFixed(1)}s</strong> compute</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
