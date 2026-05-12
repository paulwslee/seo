export default function PrivacyPage() {
  return (
    <main className="min-h-full bg-background py-20 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you use SEO Compass, we may collect personal information such as your email address, name, and billing details (processed securely via Stripe). We also collect data regarding the domains you scan and the resulting SEO metrics.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the collected information to provide, maintain, and improve our services, process payments, authenticate users, and communicate with you regarding your account and customer support inquiries.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            The security of your data is important to us. We implement standard industry practices to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use third-party services such as Stripe for payment processing and Google/Apple/Kakao for authentication. These services have their own privacy policies governing the data they collect.
          </p>
        </section>
      </div>
    </main>
  );
}
