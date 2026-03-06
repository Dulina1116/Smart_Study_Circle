import { Users, ChevronRight } from "lucide-react";

const circles = [
  {
    id: 1,
    title: "Adv. Molecular Biology",
    university: "University of Science",
    members: 24,
    subject: "Biology",
    color: "from-teal-400 to-cyan-500",
    image:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80&auto=format&fit=crop",
    avatars: [
      { initials: "AJ", color: "from-teal-400 to-cyan-400" },
      { initials: "MK", color: "from-blue-400 to-indigo-400" },
      { initials: "SR", color: "from-violet-400 to-purple-400" },
    ],
    tag: "Sciences",
  },
  {
    id: 2,
    title: "Python for Data Science",
    university: "Tech Institute",
    members: 56,
    subject: "Computer Science",
    color: "from-blue-400 to-indigo-500",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80&auto=format&fit=crop",
    avatars: [
      { initials: "PL", color: "from-pink-400 to-rose-400" },
      { initials: "TN", color: "from-orange-400 to-amber-400" },
      { initials: "KS", color: "from-teal-400 to-green-400" },
    ],
    tag: "Technology",
  },
  {
    id: 3,
    title: "Calculus & Linear Algebra",
    university: "Oxford University",
    members: 38,
    subject: "Mathematics",
    color: "from-violet-400 to-purple-500",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80&auto=format&fit=crop",
    avatars: [
      { initials: "RM", color: "from-violet-400 to-purple-400" },
      { initials: "EL", color: "from-cyan-400 to-teal-400" },
      { initials: "WA", color: "from-blue-400 to-indigo-400" },
    ],
    tag: "Mathematics",
  },
];

export default function LiveCircles() {
  return (
    <section className="py-24 bg-white" id="circles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Live Now
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Live <span className="gradient-teal-text">Study Circles</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-lg">
              Join active study groups right now and supercharge your learning.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 whitespace-nowrap group transition-colors duration-200">
            View All Circles
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover group cursor-pointer"
              style={{
                boxShadow:
                  "0 1px 3px 0 rgba(0,0,0,0.07), 0 4px 16px 0 rgba(0,0,0,0.06)",
              }}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={circle.image}
                  alt={circle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${circle.color} opacity-30`}
                />
                {/* Tag badge */}
                <span className="absolute top-3 left-3 text-xs font-semibold text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {circle.tag}
                </span>
                {/* Live indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">
                    Live
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors duration-200">
                  {circle.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {circle.university}
                </p>

                <div className="flex items-center justify-between">
                  {/* Avatar stack */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {circle.avatars.map((a, i) => (
                        <div
                          key={i}
                          className={`w-7 h-7 rounded-full bg-gradient-to-br ${a.color} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {a.initials}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Member count */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users className="w-4 h-4 text-teal-500" />
                    <span className="font-semibold text-gray-700">
                      {circle.members}
                    </span>
                    <span>online</span>
                  </div>
                </div>

                {/* Join button */}
                <button
                  className={`w-full mt-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r ${circle.color} hover:opacity-90 transition-opacity duration-200 shadow-sm`}
                >
                  Join Circle →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
