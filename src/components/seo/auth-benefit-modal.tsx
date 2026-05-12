"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ShieldCheck, History, Zap, Search, X, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

interface AuthBenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthBenefitModal({ isOpen, onClose }: AuthBenefitModalProps) {
  const t = useTranslations("Dashboard.AuthModal");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon Header */}
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-emerald-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Benefits List */}
          <div className="w-full space-y-4 mb-8">
            <BenefitItem 
              icon={<ShieldCheck className="w-5 h-5 text-amber-500" />}
              title={t('benefit1Title')}
              desc={t('benefit1Desc')}
            />
            <BenefitItem 
              icon={<History className="w-5 h-5 text-blue-500" />}
              title={t('benefit2Title')}
              desc={t('benefit2Desc')}
            />
            <BenefitItem 
              icon={<Search className="w-5 h-5 text-indigo-500" />}
              title={t('benefit3Title')}
              desc={t('benefit3Desc')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-6 rounded-2xl cursor-pointer">
                {t('loginButton')}
              </Button>
            </Link>
            <button 
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground font-medium py-2 cursor-pointer transition-colors"
            >
              {t('closeButton')}
            </button>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

function BenefitItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 text-left group">
      <div className="mt-0.5 bg-muted p-2 rounded-xl group-hover:bg-background transition-colors border border-transparent group-hover:border-border shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );
}
