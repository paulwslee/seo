"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert, Fingerprint, Lock, X } from "lucide-react";

interface AntiBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseProxy: () => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}

import { useTranslations } from "next-intl";

export function AntiBotModal({ isOpen, onClose, onUseProxy, onLogin, isLoggedIn }: AntiBotModalProps) {
  const t = useTranslations("Dashboard.AntiBotModal");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            {t("description")}
          </p>

          <div className="w-full space-y-4 mb-8">
            <div className="flex items-start gap-4 text-left group">
              <div className="mt-0.5 bg-muted p-2 rounded-xl border border-transparent shadow-sm">
                <Fingerprint className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{t("option1Title")}</h4>
                <p className="text-xs text-muted-foreground leading-tight">{t("option1Desc")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 text-left group">
              <div className="mt-0.5 bg-muted p-2 rounded-xl border border-transparent shadow-sm">
                <Lock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{t("option2Title")}</h4>
                <p className="text-xs text-muted-foreground leading-tight">{t("option2Desc")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            {isLoggedIn ? (
              <Button onClick={onUseProxy} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl cursor-pointer">
                {t("buttonUseProxy")}
              </Button>
            ) : (
              <Button onClick={onLogin} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-6 rounded-2xl cursor-pointer">
                {t("buttonLogin")}
              </Button>
            )}
            <button 
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground font-medium py-2 cursor-pointer transition-colors"
            >
              {t("buttonCancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
