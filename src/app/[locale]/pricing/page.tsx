import { Link } from "@/i18n/routing";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

export default async function PricingPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main className="min-h-full bg-background pt-10 pb-20 px-6 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-3">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Identify and fix critical SEO vulnerabilities instantly. Choose the plan that fits your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        {/* Free Plan */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1">Free Starter</h3>
            <p className="text-sm text-muted-foreground">Perfect for individuals and small sites.</p>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-extrabold">$0</span>
            <span className="text-muted-foreground"> / month</span>
          </div>
          <ul className="space-y-3 mb-6 flex-1 text-sm">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Up to 3 Domains</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Basic SEO Scanning</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>7-Day Scan History</span>
            </li>
          </ul>
          <Link href="/login">
            <button className="w-full py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-colors cursor-pointer text-sm">
              Get Started for Free
            </button>
          </Link>
        </div>

        {/* Premium Plan */}
        <div className="bg-background border-2 border-emerald-500 rounded-3xl p-6 shadow-lg shadow-emerald-500/10 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1">Pro Unlimited</h3>
            <p className="text-sm text-muted-foreground">For agencies and professional marketers.</p>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-extrabold">$1.99</span>
            <span className="text-muted-foreground"> / month</span>
          </div>
          <ul className="space-y-3 mb-6 flex-1 text-sm">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold">Unlimited Domains</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold">Unlimited Scans</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Deep Performance & Technical Audits</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Unlimited Scan History</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Priority Customer Support</span>
            </li>
          </ul>
          <Link href="/login">
            <button className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all hover:shadow-md cursor-pointer text-sm">
              Upgrade to Pro
            </button>
          </Link>
        </div>
      </div>

      {/* Trust & Cancellation Banner */}
      <div className="max-w-4xl mx-auto w-full mt-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 text-center flex flex-col items-center shadow-sm">
        <div className="bg-emerald-500/10 w-10 h-10 rounded-full flex items-center justify-center mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-4">No Contracts. No Hassle. 100% Risk-Free.</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full max-w-3xl">
          <div className="bg-background/50 rounded-xl p-3 sm:p-4 border border-border/30 shadow-sm">
            <div className="font-bold text-foreground mb-1.5 flex items-center gap-1.5"><span className="text-lg">🔒</span> Stripe Secured</div>
            <p className="text-muted-foreground text-sm leading-snug">We never store your card data. Payments are safely managed by <strong>Stripe</strong>.</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3 sm:p-4 border border-border/30 shadow-sm">
            <div className="font-bold text-foreground mb-1.5 flex items-center gap-1.5"><span className="text-lg">🖱️</span> 1-Click Cancel</div>
            <p className="text-muted-foreground text-sm leading-snug">Cancel instantly inside your Dashboard anytime. No hidden fees or hurdles.</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3 sm:p-4 border border-border/30 shadow-sm">
            <div className="font-bold text-foreground mb-1.5 flex items-center gap-1.5"><span className="text-lg">🤝</span> Freedom to Choose</div>
            <p className="text-muted-foreground text-sm leading-snug">Leave whenever you want, and easily resubscribe when you need us again.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
