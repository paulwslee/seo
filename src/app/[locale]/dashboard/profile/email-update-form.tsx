"use client";

import { useState } from "react";
import { updateContactEmail } from "./actions";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

export function EmailUpdateForm({ currentEmail, userId }: { currentEmail: string, userId: string }) {
  const [email, setEmail] = useState(currentEmail.endsWith("@kakao.com") ? "" : currentEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError("");
    setSuccess(false);
    
    const res = await updateContactEmail(email);
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. your@email.com"
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          required
        />
        {error && (
          <div className="absolute -bottom-6 left-0 text-xs text-red-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" /> {error}
          </div>
        )}
        {success && (
          <div className="absolute -bottom-6 left-0 text-xs text-emerald-500 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Email updated successfully!
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !email || email === currentEmail}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
      >
        <Save className="w-4 h-4" />
        {loading ? "Saving..." : "Save Email"}
      </button>
    </form>
  );
}
