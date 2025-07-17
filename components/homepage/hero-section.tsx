import { FileText, Shield, Brain } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-20">
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 lg:px-0">
        <div className="relative text-center">
          <div className="mx-auto mb-6 flex w-fit items-center justify-center rounded-full bg-primary/10 p-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold">
            EULAlyzer AI
          </h1>
          <p className="mx-auto mb-8 mt-6 max-w-2xl text-balance text-xl text-muted-foreground">
            Understand what you&apos;re signing—before you click agree. 
            AI-powered EULA analysis that explains legal risks in plain English.
          </p>
          
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-center">
              <Brain className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI reads and understands complex legal language
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <Shield className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold">Risk Score</h3>
              <p className="text-sm text-muted-foreground">
                Get a clear 1-100 risk assessment with detailed reasoning
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold">Plain English</h3>
              <p className="text-sm text-muted-foreground">
                Complex legal terms explained in language anyone can understand
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
