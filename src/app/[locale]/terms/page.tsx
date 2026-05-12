export default function TermsPage() {
  return (
    <main className="min-h-full bg-background py-20 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Agreement to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using SEO Compass ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            SEO Compass provides search engine optimization analysis, scanning tools, and performance reporting. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Subscriptions and Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            Some aspects of the Service are billed on a subscription basis ("Premium Plan"). You will be billed in advance on a recurring, periodic basis. All payments are processed securely via Stripe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service and its original content, features, and functionality are owned by AppFactorys and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall SEO Compass, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the Service.
          </p>
        </section>
      </div>
    </main>
  );
}
