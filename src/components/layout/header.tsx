import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./language-switcher"
import { getTranslations } from "next-intl/server"
import { auth } from "@/auth"

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Header' });
  const session = await auth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-6xl mx-auto items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-extrabold text-xl tracking-tight">SEO <span className="text-emerald-500">Compass</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#how-it-works" className="transition-colors hover:text-foreground text-muted-foreground cursor-pointer">{t('howItWorks')}</Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground text-muted-foreground cursor-pointer">{t('pricing')}</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            {session?.user ? (
              <div className="flex items-center gap-3 ml-2">
                <span className="text-sm font-semibold hidden sm:inline-block">
                  {session.user.name || session.user.email}
                </span>
                <Link href="/api/auth/signout" className="hidden sm:flex">
                  <Button variant="outline" size="sm" className="cursor-pointer">Sign out</Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/api/auth/signin" className="hidden sm:flex">
                  <Button variant="outline" size="sm" className="cursor-pointer w-full">{t('login')}</Button>
                </Link>
                <Link href="/api/auth/signin" className="hidden sm:flex">
                  <Button size="sm" className="cursor-pointer w-full">{t('signup')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
