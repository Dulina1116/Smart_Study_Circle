import { ArrowRight, Play } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-teal" />
      {/* Decorative circles */}
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white/90 text-sm font-medium backdrop-blur-sm">
          🎓 Join 8,000+ students today
        </div>

        <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Ready to boost your grades?
        </h2>

        <p className="text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
          Join thousands of students transforming their academic journey with
          Smart Study Circle.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-teal-600 bg-white rounded-xl hover:bg-teal-50 transition-all duration-200 shadow-lg hover:shadow-xl group">
            Get Started for Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white border-2 border-white/40 rounded-xl hover:bg-white/10 transition-all duration-200 group backdrop-blur-sm">
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            View Demo
          </button>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-4 opacity-80">
          {["MIT", "Stanford", "Oxford", "Harvard", "Cambridge"].map((uni) => (
            <span
              key={uni}
              className="text-white text-sm font-bold tracking-wide"
            >
              {uni}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
