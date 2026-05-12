export default function RefundPage() {
  return (
    <main className="min-h-full bg-background py-20 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8">Refund Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. All Sales Are Final</h2>
          <p className="text-muted-foreground leading-relaxed">
            Due to the immediate access to unlimited digital data and deep scanning capabilities upon upgrading, <strong>all payments are non-refundable</strong>. We highly encourage all users to thoroughly evaluate our tools using the <strong>Free Starter Plan</strong> before committing to a Premium subscription.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Try Before You Buy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We intentionally provide a robust Free Plan so you can experience the core features of SEO Compass without any financial commitment. Please use this free tier to ensure our services perfectly meet your needs before upgrading.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Subscription Cancellations</h2>
          <p className="text-muted-foreground leading-relaxed">
            While we do not offer refunds for payments already processed, you have the absolute freedom to cancel your subscription at any time. Canceling is easy and can be done with a single click inside your Dashboard. Once canceled, you will not be billed for any future cycles, and you will retain access to your Premium features until the end of your current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Billing Errors</h2>
          <p className="text-muted-foreground leading-relaxed">
            In the rare event of a technical billing error on our end (e.g., accidental duplicate charges), please contact our support team at support@appfactorys.com within 7 days of the charge, and we will promptly investigate and rectify the issue.
          </p>
        </section>
      </div>
    </main>
  );
}
