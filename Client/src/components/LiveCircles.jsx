import { ArrowUpRight, Clock3, Signal, Users2 } from "lucide-react";

const circles = [
  {
    title: "AI for Healthcare",
    school: "Global Tech University",
    members: 32,
    next: "Starts in 05 min",
    status: "High Focus",
    tone: "from-teal-500 to-cyan-500",
  },
  {
    title: "Modern Physics Intensive",
    school: "National Science Campus",
    members: 21,
    next: "Starts in 12 min",
    status: "Live",
    tone: "from-sky-500 to-blue-500",
  },
  {
    title: "Financial Accounting Core",
    school: "City Business School",
    members: 27,
    next: "Starts in 08 min",
    status: "Live",
    tone: "from-indigo-500 to-violet-500",
  },
];

export default function LiveCircles() {
  return (
    <section id="circles" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-up mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
              <Signal className="h-4 w-4" />
              Happening Right Now
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Recreated Live Circles,
              <span className="gradient-teal-text"> Cleaner and Faster</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-500">
              Instantly see what is active, who is online, and where to jump in
              next with fewer clicks.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 self-start rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100 lg:self-auto">
            View full schedule
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="perspective-container grid grid-cols-1 gap-6 lg:grid-cols-3">
          {circles.map((circle, idx) => (
            <article key={circle.title} className="card-3d card-hover animate-fade-up animate-scale-in depth-effect shadow-3d h-full overflow-hidden rounded-2xl border border-gray-100 bg-white hover:border-teal-200 animate-glow-hover" style={{ animationDelay: `${idx * 120}ms` }}>
              <div className={`h-1 bg-gradient-to-r ${circle.tone}`} />
              <div className="flex h-full flex-col space-y-5 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{circle.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{circle.school}</p>
                  </div>
                  <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    {circle.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3 transition-colors hover:bg-teal-50">
                    <p className="text-xs text-gray-500">Members online</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-gray-900">
                      <Users2 className="h-4 w-4 text-teal-500" />
                      {circle.members}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 transition-colors hover:bg-teal-50">
                    <p className="text-xs text-gray-500">Next event</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-gray-900">
                      <Clock3 className="h-4 w-4 text-teal-500" />
                      {circle.next}
                    </p>
                  </div>
                </div>

                <button className={`mt-auto w-full rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${circle.tone}`}>
                  Join this circle
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
