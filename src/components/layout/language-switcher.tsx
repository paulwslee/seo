"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    const queryString = searchParams.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newPath, { locale: nextLocale });
  };

  return (
    <select 
      value={locale} 
      onChange={handleLanguageChange}
      className="bg-transparent text-sm cursor-pointer outline-none hover:text-foreground text-muted-foreground transition-colors"
    >
      <option value="en">EN</option>
      <option value="ko">KO</option>
    </select>
  );
}
