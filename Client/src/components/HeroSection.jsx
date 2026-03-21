import { ArrowRight, Clock3, Play, Sparkles, TrendingUp } from "lucide-react";

const quickStats = [
  { value: "12k+", label: "Weekly active learners" },
  { value: "91%", label: "Session completion" },
  { value: "24/7", label: "Live circle activity" },
];

const timeline = [
  { time: "09:00", title: "Data Structures Drill", members: 18 },
  { time: "11:30", title: "Organic Chemistry Lab Review", members: 14 },
  { time: "16:00", title: "Calculus Problem Sprint", members: 22 },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-20 lg:pb-24 lg:pt-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 right-0 h-72 w-72 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="absolute top-24 -left-24 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl" />
      </div>

      <div className="perspective-container relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="animate-fade-up space-y-8">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            <Sparkles className="h-4 w-4" />
            Rebuilt for high-focus collaborative learning
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            The New Home for
            <span className="gradient-teal-text"> Serious Study Teams</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-gray-500">
            Plan sessions, track momentum, and keep every member accountable with
            a landing experience built around clarity, speed, and real-time study
            energy.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button className="group inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-teal-animated px-7 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:opacity-95 hover:shadow-lg sm:w-auto">
              Start Learning Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-7 py-4 text-base font-semibold text-gray-700 transition-all duration-200 hover:border-teal-300 hover:text-teal-600 sm:w-auto">
              <Play className="h-4 w-4 text-teal-500 transition-transform group-hover:scale-110" />
              Preview Live Demo
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickStats.map((item, idx) => (
              <div
                key={item.label}
                className="animate-scale-in rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 transition-all hover:border-teal-300 hover:shadow-md"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <p className="text-2xl font-extrabold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-up floating-3d">
          <div className="card-3d depth-effect shadow-3d relative overflow-hidden rounded-3xl border border-teal-100 bg-white p-4 sm:p-6 animate-glow-hover">
            <div className="absolute inset-x-0 top-0 h-1 gradient-teal" />

            <div className="card-3d relative mb-5 overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80&auto=format&fit=crop"
                alt="Students collaborating around a laptop in a bright study environment"
                className="h-48 w-full object-cover transition-transform duration-300 hover:scale-110 sm:h-56"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur-sm">
                Collaborative session in progress
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today&apos;s Study Board</p>
                <p className="text-xl font-bold text-gray-900">Thursday Schedule</p>
              </div>
              <div className="floating-3d animate-float-soft rounded-xl bg-teal-50 p-2.5 shadow-3d">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
            </div>

            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-600">
                      <Clock3 className="h-3.5 w-3.5 text-teal-500" />
                      {item.time}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 sm:flex-1 sm:px-3">{item.title}</p>
                    <span className="text-xs font-medium text-gray-500">{item.members} online</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-700">Circle focus score</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-teal-100">
                <div className="h-full w-[86%] rounded-full gradient-teal" />
              </div>
              <p className="mt-2 text-xs text-gray-500">86% stronger consistency than last week</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
