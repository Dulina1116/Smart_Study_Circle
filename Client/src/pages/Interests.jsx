import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const STUDENT_INTERESTS = [
  {
    id: "computer_science",
    icon: "💻",
    label: "Computer Science",
    sub: "AI, Algorithms, Dev",
  },
  {
    id: "web_dev",
    icon: "🌐",
    label: "Web Development",
    sub: "React, Node, CSS",
  },
  {
    id: "data_science",
    icon: "📊",
    label: "Data Science",
    sub: "Analytics, Viz, Stats",
  },
  { id: "ai_ml", icon: "🤖", label: "AI & ML", sub: "Deep Learning, NLP" },
  {
    id: "cybersecurity",
    icon: "🔐",
    label: "Cybersecurity",
    sub: "Networks, Ethical Hacking",
  },
  {
    id: "mobile_dev",
    icon: "📱",
    label: "Mobile Dev",
    sub: "Flutter, React Native",
  },
  {
    id: "cloud",
    icon: "☁️",
    label: "Cloud Computing",
    sub: "AWS, Azure, DevOps",
  },
  {
    id: "database",
    icon: "🗄️",
    label: "Databases",
    sub: "SQL, MongoDB, Redis",
  },
  {
    id: "software_eng",
    icon: "⚙️",
    label: "Software Eng",
    sub: "Patterns, Architecture",
  },
  { id: "ui_ux", icon: "🎨", label: "UI/UX Design", sub: "Figma, Prototyping" },
  {
    id: "networking",
    icon: "🔗",
    label: "Networking",
    sub: "Protocols, TCP/IP",
  },
  {
    id: "blockchain",
    icon: "⛓️",
    label: "Blockchain",
    sub: "Web3, Smart Contracts",
  },
  { id: "game_dev", icon: "🎮", label: "Game Dev", sub: "Unity, Unreal, C++" },
  { id: "iot", icon: "📡", label: "IoT", sub: "Arduino, Raspberry Pi" },
  {
    id: "mathematics",
    icon: "📐",
    label: "Mathematics",
    sub: "Calculus, Stats, Logic",
  },
  { id: "physics", icon: "⚛️", label: "Physics", sub: "Mechanics, Quantum" },
];

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Interests() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const items = STUDENT_INTERESTS;
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          i.label.toLowerCase().includes(search.toLowerCase()) ||
          i.sub.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, items],
  );

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const handleFinish = async () => {
    if (selected.length < 3) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate("/");
  };

  const progress = Math.min((selected.length / 3) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fffe]">
      {/* ── Navbar ── */}
      <nav
        className="flex items-center justify-between px-8 py-4
        bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
            font-black text-lg bg-white border-2"
            style={{ color: "#00b8a9", borderColor: "#00b8a9" }}
          >
            ✦
          </div>
          <span className="font-bold text-[#1a1a2e] text-sm">
            Smart Study Circle
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">Step 3 of 3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === 3 ? "2rem" : "1rem",
                  background: "#00b8a9",
                }}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center px-6 py-10 pb-32">
        {/* Header */}
        <div className="text-center mb-8 max-w-xl">
          <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-3 font-head">
            What sparks your interest?
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            We'll use this to suggest the best study circles for you. Choose at
            least 3 topics to get started.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xl mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for modules or topics..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-[#1a1a2e]
              outline-none border border-gray-200 bg-white
              placeholder:text-gray-400 transition-all"
            style={{ boxShadow: "0 2px 8px rgba(0,184,169,0.08)" }}
            onFocus={(e) => (e.target.style.borderColor = "#00b8a9")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
          {filtered.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={`relative flex flex-col gap-2 p-5 rounded-2xl text-left
                  border-2 transition-all duration-200 hover:scale-[1.02] bg-white ${
                    isSelected
                      ? "border-[#00b8a9] shadow-[0_0_0_3px_rgba(0,184,169,0.12)]"
                      : "border-gray-100 hover:border-[#00b8a9]/40 shadow-sm"
                  }`}
              >
                {/* Check circle */}
                <div
                  className={`absolute top-3 right-3 w-6 h-6 rounded-full
                  flex items-center justify-center border-2 transition-all ${
                    isSelected
                      ? "bg-[#00b8a9] border-[#00b8a9] text-white"
                      : "border-gray-200"
                  }`}
                >
                  {isSelected && <CheckIcon />}
                </div>

                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center
                  text-xl mb-1 ${isSelected ? "bg-[#e0f7f5]" : "bg-[#f8f9fa]"}`}
                >
                  {item.icon}
                </div>

                <p
                  className={`text-sm font-bold ${
                    isSelected ? "text-[#00b8a9]" : "text-[#1a1a2e]"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-12 text-gray-400 text-sm">
              No topics found for "
              <span className="text-gray-600">{search}</span>"
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-gray-100
        bg-white px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-4">
          <div>
            <span className="font-bold text-sm" style={{ color: "#00b8a9" }}>
              {selected.length} interests
            </span>
            <span className="text-gray-400 text-sm"> selected</span>
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="ml-3 text-xs text-gray-300 hover:text-gray-500
                  transition-colors underline"
              >
                Clear all
              </button>
            )}
          </div>

          {selected.length < 3 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "#00b8a9" }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {3 - selected.length} more needed
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Skip */}
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
              text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>

          <button
            onClick={handleFinish}
            disabled={selected.length < 3 || loading}
            className="px-7 py-2.5 rounded-xl font-bold text-sm text-white
              flex items-center gap-2 transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-lg
              disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background:
                selected.length >= 3
                  ? "linear-gradient(135deg, #00b8a9, #007a6e)"
                  : "#e5e7eb",
              color: selected.length >= 3 ? "white" : "#9ca3af",
            }}
          >
            {loading ? (
              "⏳ Saving..."
            ) : (
              <>
                Finish Onboarding <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
