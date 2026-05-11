"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    // Simple naive replacement for the locale in the pathname. 
    // In production, using next-intl routing features is better, but this works for basic setup.
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath || `/${nextLocale}`);
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
