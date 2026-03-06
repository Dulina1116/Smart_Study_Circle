import { Play, ArrowRight, Users, Wifi, BarChart2 } from "lucide-react";

const avatars = [
  { initials: "AJ", color: "from-teal-400 to-cyan-400" },
  { initials: "SR", color: "from-blue-400 to-indigo-400" },
  { initials: "MK", color: "from-violet-400 to-purple-400" },
  { initials: "PL", color: "from-pink-400 to-rose-400" },
];

const universities = ["MIT", "Stanford", "Oxford"];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
      {/* Soft background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-cyan-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-80 h-80 bg-teal-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-16 right-1/4 w-64 h-64 bg-blue-50 rounded-full opacity-60 blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              The Future of Peer Learning is Here
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Empowering <span className="gradient-teal-text">Peer-Led</span>{" "}
              Learning
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              Connect with peers, collaborate on complex topics, and accelerate
              your academic journey with intelligent study management.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-white rounded-xl gradient-teal hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg group">
                Get Started for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-gray-700 rounded-xl border-2 border-gray-200 hover:border-teal-300 hover:text-teal-600 bg-white transition-all duration-200 group">
                <Play className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {avatars.map((a, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${a.color} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {a.initials}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold shadow-sm">
                  +8k
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Trusted by students from{" "}
                <span className="font-semibold text-gray-700">
                  {universities.join(", ")} & more
                </span>
              </p>
            </div>
          </div>

          {/* Right column – image + floating card */}
          <div className="relative lg:h-[540px] flex items-center justify-center">
            {/* Main image card */}
            <div className="relative w-full max-w-lg">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=80&auto=format&fit=crop"
                  alt="Students studying together with laptops"
                  className="w-full h-80 lg:h-96 object-cover"
                />
              </div>

              {/* Floating card – Live Session */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-card-hover border border-gray-100 p-4 min-w-[220px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                    Live Session
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-2">
                  Physics Group A
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span className="font-semibold text-teal-600">84%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-teal rounded-full transition-all duration-700"
                      style={{ width: "84%" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    12 members active
                  </span>
                </div>
              </div>

              {/* Floating stats card – top right */}
              <div className="absolute -top-5 -right-4 bg-white rounded-2xl shadow-card-hover border border-gray-100 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 gradient-teal rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      +1.5 Points
                    </p>
                    <p className="text-xs text-teal-600 font-medium">
                      Weekly Growth
                    </p>
                  </div>
                </div>
              </div>

              {/* Online count badge */}
              <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-2xl shadow-card-hover border border-gray-100 p-3">
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-teal-500" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">142 Live</p>
                    <p className="text-xs text-gray-400">Study Groups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
