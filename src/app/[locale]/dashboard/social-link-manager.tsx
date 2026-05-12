"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight, X, Mail, ShieldAlert } from "lucide-react";
import { requestDisconnect, confirmDisconnect } from "./actions";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function SocialLinkManager({ provider, label, isConnected, totalAccounts }: { provider: string, label: string, isConnected: boolean, totalAccounts: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"initial" | "confirming" | "code">("initial");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const handleRequest = async () => {
    if (totalAccounts <= 1) {
      alert("You must have at least one connected account to log in.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await requestDisconnect(provider);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      
      if (res.requiresCode) {
        setStep("code");
        setMessage(res.message || "");
      } else if (res.requiresConfirmation) {
        setStep("confirming");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };
  
  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await confirmDisconnect(provider, step === "code" ? code : undefined);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      
      if (res.success) {
        setStep("initial");
        router.refresh(); // Refresh page to show disconnected state
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  if (!isConnected) {
    return (
      <button 
        onClick={() => signIn(provider, { callbackUrl: "/dashboard" })}
        className="group w-full flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/50 hover:border-foreground/30 hover:bg-muted/30 hover:shadow-md transition-all text-left cursor-pointer"
      >
        <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Connect {label}</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-1.5 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{label} Connected</span>
        </div>
        
        {step === "initial" && totalAccounts > 1 && (
          <button 
            onClick={handleRequest}
            disabled={loading}
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "..." : "Disconnect"}
          </button>
        )}
      </div>

      {step !== "initial" && (
        <div className="mt-3 p-4 bg-background rounded-lg border border-red-500/30 flex flex-col gap-3">
          {error && <p className="text-xs font-bold text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
          
          {step === "code" ? (
            <>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm font-medium">{message}</p>
              </div>
              <input 
                type="text" 
                placeholder="6-digit code" 
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                maxLength={6}
              />
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5" />
                <p className="text-sm font-medium">Are you sure you want to disconnect {label}?</p>
              </div>
              <p className="text-xs text-muted-foreground">Type <strong>disconnect</strong> to confirm.</p>
              <input 
                type="text" 
                placeholder="disconnect" 
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </>
          )}
          
          <div className="flex gap-2 w-full mt-1">
            <button 
              onClick={() => { setStep("initial"); setError(""); setCode(""); }}
              className="flex-1 text-sm font-semibold text-muted-foreground bg-muted hover:bg-muted/80 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={loading || (step !== "code" && code !== "disconnect") || (step === "code" && code.length < 6)}
              className="flex-1 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? "..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
