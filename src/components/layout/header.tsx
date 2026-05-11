import { Link } from "@/i18n/routing"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./language-switcher"
import { getTranslations } from "next-intl/server"
import { auth } from "@/auth"
import { isAdmin } from "@/lib/admin"

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
                {/* Removed email display for privacy */}
                {isAdmin(session.user.email) && (
                  <Link href="/admin">
                    <Button variant="default" size="sm" className="cursor-pointer bg-black text-white hover:bg-gray-800 dark:bg-emerald-600 dark:hover:bg-emerald-700">👑 Admin</Button>
                  </Link>
                )}
                <Link href="/dashboard" className="hidden sm:flex">
                  <Button variant="ghost" size="sm" className="cursor-pointer">Dashboard</Button>
                </Link>
                <form action={async () => {
                  "use server";
                  await auth().then(s => s && require("@/auth").signOut({ redirectTo: "/" }));
                }} className="hidden sm:flex">
                  <Button variant="outline" size="sm" type="submit" className="cursor-pointer">Sign out</Button>
                </form>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:flex">
                  <Button variant="outline" size="sm" className="cursor-pointer w-full">{t('login')}</Button>
                </Link>
                <Link href="/login" className="hidden sm:flex">
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
