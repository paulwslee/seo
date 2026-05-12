export default function ContactPage() {
  return (
    <main className="min-h-full bg-background py-20 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8">Contact Us</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          We are here to help. If you have any questions, feedback, or need assistance with your SEO Compass account, please do not hesitate to reach out to our support team.
        </p>
        
        <div className="bg-card border border-border/50 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Customer Support</h2>
          <p className="mb-2"><strong>Email:</strong> support@appfactorys.com</p>
          <p className="mb-2"><strong>Response Time:</strong> We typically respond within 24-48 business hours.</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Business Inquiries</h2>
          <p className="mb-2"><strong>Email:</strong> hello@appfactorys.com</p>
          <p className="mb-2"><strong>Company:</strong> AppFactorys LLC</p>
        </div>
      </div>
    </main>
  );
}
