"use client";

import { useState } from "react";
import { Settings, Users, Activity, Loader2 } from "lucide-react";
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
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex flex-col gap-2">
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
      <div className="flex-1 bg-card border border-border rounded-xl p-6 min-h-[500px]">
        
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
                  className="w-full md:w-96 p-3 bg-background border border-border rounded-lg outline-none focus:border-emerald-500"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast, Low Cost)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning, High Cost)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>
                </select>
                <button 
                  onClick={handleSaveModel}
                  disabled={loading}
                  className="mt-2 bg-foreground text-background font-semibold px-6 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Settings
                </button>
              </div>

              <div className="bg-muted/50 p-6 rounded-xl border border-border space-y-4">
                <h3 className="font-bold">Cost Simulator</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Cost per 1M Tokens</p>
                    <p className="font-mono text-lg font-semibold">{selectedModel.includes("flash") ? "$0.075" : "$1.25"}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Estimated Scan Cost</p>
                    <p className="font-mono text-lg font-semibold text-emerald-500">{selectedModel.includes("flash") ? "~$0.00015" : "~$0.0025"}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border col-span-2">
                    <p className="text-xs text-muted-foreground">Margin on $9.99 Premium (100 Scans)</p>
                    <p className="font-mono text-lg font-semibold text-indigo-500">
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
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold border-b border-border pb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-4 font-medium">{u.email}</td>
                      <td className="py-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.plan === 'premium' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                          {u.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => handleTogglePlan(u.id, u.plan)}
                          className="text-xs border border-border bg-background hover:bg-foreground hover:text-background px-3 py-1.5 rounded-md transition-colors"
                        >
                          Toggle Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">No users found.</td>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background border border-border rounded-xl p-5 shadow-sm">
                <p className="text-sm text-muted-foreground font-medium">Total Global API Calls</p>
                <h3 className="text-4xl font-extrabold mt-2">{totalCalls.toLocaleString()}</h3>
              </div>
              <div className="bg-background border border-border rounded-xl p-5 shadow-sm">
                <p className="text-sm text-muted-foreground font-medium">Total Compute Duration</p>
                <h3 className="text-4xl font-extrabold mt-2 text-indigo-500">{(totalDuration / 1000).toFixed(1)}s</h3>
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
