"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export function LoginForm() {
  const t = useTranslations("Header");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      await signIn("nodemailer", { email, callbackUrl: "/" });
      setIsSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-6 bg-card rounded-2xl shadow-sm border border-border" style={{ maxWidth: '400px', padding: '2rem' }}>
      {isSent ? (
        <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-center">
          <p className="text-sm font-medium">Check your email!</p>
          <p className="text-xs mt-1">A magic link has been sent to {email}</p>
        </div>
      ) : (
        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4 pt-2">
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="w-full h-11"
          />
          <Button type="submit" className="w-full h-11 cursor-pointer hover:scale-[1.02] transition-transform" disabled={isLoading}>
            {isLoading ? "Sending..." : "Continue with Email"}
          </Button>
        </form>
      )}

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-black px-4 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full font-normal cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all hover:scale-[1.02]" 
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
        <Button 
          variant="outline" 
          className="w-full font-normal cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all hover:scale-[1.02]" 
          onClick={() => signIn("apple", { callbackUrl: "/" })}
        >
          <svg className="w-5 h-5 mr-2 text-foreground fill-current" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.82 1.5-.06 2.59.45 3.37 1.45-2.67 1.35-2.08 4.7.55 5.51-.7 1.83-1.6 3.82-2.58 6.03M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.35 2.39-1.87 4.23-3.74 4.25"/>
          </svg>
          Continue with Apple
        </Button>
        <Button 
          variant="outline" 
          className="w-full font-normal cursor-pointer transition-all hover:scale-[1.02]" 
          style={{ backgroundColor: '#FEE500', color: '#000000', borderColor: '#FEE500' }}
          onClick={() => signIn("kakao", { callbackUrl: "/" })}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#000000" d="M12 3C6.48 3 2 6.46 2 10.73c0 2.76 1.82 5.17 4.54 6.47-.15.48-.48 1.63-.55 1.88-.09.34.12.33.26.24.11-.08 1.76-1.18 2.49-1.67a10.42 10.42 0 003.26.52c5.52 0 10-3.46 10-7.73S17.52 3 12 3z"/>
          </svg>
          Continue with Kakao
        </Button>
      </div>
    </div>
  );
}
