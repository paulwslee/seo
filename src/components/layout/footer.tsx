import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-6 md:py-0 mt-auto">
      <div className="container flex flex-col md:flex-row h-16 max-w-6xl mx-auto items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SEO Compass. All rights reserved.
        </p>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4 md:mt-0">
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
        </nav>
      </div>
    </footer>
  )
}
