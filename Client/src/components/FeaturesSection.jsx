import { BellRing, BrainCircuit, Layers3, ShieldCheck, Target, Workflow } from "lucide-react";

const featureBlocks = [
  {
    title: "Live Focus Rooms",
    description:
      "Create timed deep-work rooms with clear outcomes, role assignment, and shared notes.",
    icon: <BrainCircuit className="h-5 w-5" />,
    tone: "from-teal-500 to-cyan-500",
    span: "md:col-span-2",
  },
  {
    title: "Goal Milestones",
    description: "Break each subject into weekly wins and visible progress checkpoints.",
    icon: <Target className="h-5 w-5" />,
    tone: "from-blue-500 to-indigo-500",
    span: "md:col-span-1",
  },
  {
    title: "Smart Workflows",
    description: "Distribute tasks automatically and avoid duplicate effort across members.",
    icon: <Workflow className="h-5 w-5" />,
    tone: "from-teal-500 to-emerald-500",
    span: "md:col-span-1",
  },
  {
    title: "Faculty Alerts",
    description:
      "Notify lecturers only when support is needed, keeping circles student-led by default.",
    icon: <BellRing className="h-5 w-5" />,
    tone: "from-cyan-500 to-sky-500",
    span: "md:col-span-1",
  },
  {
    title: "Institution Ready",
    description:
      "Secure access controls, department views, and adoption analytics for admins at scale.",
    icon: <ShieldCheck className="h-5 w-5" />,
    tone: "from-indigo-500 to-violet-500",
    span: "md:col-span-1",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-gradient-to-b from-white to-teal-50/40 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-up text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            <Layers3 className="h-4 w-4" />
            New Landing Experience
          </div>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Everything Your Circle Needs
            <span className="gradient-teal-text"> In One Flow</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500 sm:text-lg">
            The redesigned feature layout highlights the practical tools students
            use every day, without visual clutter.
          </p>
        </div>

        <div className="perspective-container mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {featureBlocks.map((item, idx) => (
            <article
              key={item.title}
              className={`card-3d card-hover animate-fade-up animate-scale-in depth-effect shadow-3d h-full rounded-2xl border border-gray-100 bg-white p-6 hover:border-teal-200 ${item.span}`}
              style={{ animationDelay: `${idx * 90}ms` }}
            >
              <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-2.5 text-white transition-transform hover:scale-110 ${item.tone}`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
