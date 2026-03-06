import {
  MessageCircle,
  Share2,
  Trophy,
  BookOpen,
  Activity,
  Megaphone,
  Users,
  BarChart,
  Plug,
} from "lucide-react";

const roles = [
  {
    role: "Student",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-teal-500 to-cyan-500",
    bg: "bg-teal-50",
    border: "border-teal-100",
    accent: "text-teal-600",
    description:
      "Excel in your studies with the power of peer collaboration and smart tools.",
    features: [
      {
        icon: <MessageCircle className="w-4 h-4" />,
        text: "Peer-to-peer chat",
      },
      { icon: <Share2 className="w-4 h-4" />, text: "Resource sharing" },
      { icon: <Trophy className="w-4 h-4" />, text: "Gamified progress" },
    ],
  },
  {
    role: "Lecturer",
    icon: <Megaphone className="w-6 h-6" />,
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    accent: "text-blue-600",
    description:
      "Engage your students effectively with insights and direct communication.",
    features: [
      { icon: <BookOpen className="w-4 h-4" />, text: "Content management" },
      { icon: <Activity className="w-4 h-4" />, text: "Engagement heatmaps" },
      { icon: <Megaphone className="w-4 h-4" />, text: "Direct announcements" },
    ],
  },
  {
    role: "Admin",
    icon: <Users className="w-6 h-6" />,
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    accent: "text-violet-600",
    description:
      "Oversee your institution with comprehensive dashboards and integrations.",
    features: [
      { icon: <Users className="w-4 h-4" />, text: "User management" },
      {
        icon: <BarChart className="w-4 h-4" />,
        text: "Institutional analytics",
      },
      { icon: <Plug className="w-4 h-4" />, text: "Integration API" },
    ],
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50/50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium">
            Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Tailored Experience for{" "}
            <span className="gradient-teal-text">Everyone</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Whether you're learning, teaching, or managing — Smart Study Circle
            has you covered.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((item) => (
            <div
              key={item.role}
              className={`relative bg-white rounded-2xl border ${item.border} p-8 card-hover group cursor-pointer`}
              style={{
                boxShadow:
                  "0 1px 3px 0 rgba(0,0,0,0.07), 0 4px 16px 0 rgba(0,0,0,0.06)",
              }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                {item.icon}
              </div>

              {/* Role badge */}
              <span
                className={`inline-block text-xs font-semibold uppercase tracking-widest ${item.accent} ${item.bg} px-2.5 py-1 rounded-full mb-3`}
              >
                {item.role}
              </span>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.role}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Feature list */}
              <ul className="space-y-3">
                {item.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <span className={`${item.accent} opacity-80`}>
                      {f.icon}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
