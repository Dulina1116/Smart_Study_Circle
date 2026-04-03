import { ArrowRight, CheckCircle2 } from "lucide-react";

const promises = [
  "No setup complexity for students",
  "Built-in session structure and accountability",
  "Clear progress visibility for every role",
];

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 gradient-teal-animated" />
      <div className="absolute -top-12 -right-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="perspective-container relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 animate-fade-up">
        <div className="card-3d animate-scale-in layered-depth rounded-3xl border border-white/30 bg-white/10 p-6 backdrop-blur-md transition-all hover:border-white/50 sm:p-8 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Recreated Landing. Same Theme.
          </p>
          <h2 className="mt-3 max-w-3xl text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Launch Your First Circle in Minutes and Keep It Growing Weekly
          </h2>
          <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            The new page flow is optimized for clarity and conversion while
            staying true to your original color direction.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {promises.map((item, idx) => (
              <div
                key={item}
                className="animate-scale-in inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm text-white transition-all hover:bg-white/25"
                style={{ animationDelay: `${100 + idx * 80}ms` }}
              >
                <CheckCircle2 className="h-4 w-4" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="animate-scale-in group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-teal-700 transition-all hover:bg-teal-50 hover:shadow-lg sm:w-auto" style={{ animationDelay: '200ms' }}>
              Create Circle Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="animate-scale-in inline-flex w-full items-center justify-center rounded-xl border-2 border-white/40 px-7 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white/60 sm:w-auto" style={{ animationDelay: '250ms' }}>
              Talk to your campus admin
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
