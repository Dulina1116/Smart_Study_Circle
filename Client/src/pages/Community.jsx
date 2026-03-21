import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Users, MessageSquare, Sparkles, TrendingUp } from "lucide-react";

export default function Community() {
  const stats = [
    { label: "Active Circles", value: "2,400+", icon: Users },
    { label: "Messages & Discussions", value: "45K+", icon: MessageSquare },
    { label: "Study Materials Shared", value: "12K+", icon: Sparkles },
    { label: "Academic Growth Tracked", value: "89% avg", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <span className="inline-block mb-4 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
              👥 Join Us
            </span>
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Our <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Community</span>
            </h1>
            <p className="text-lg text-gray-600">Connect with thousands of students, share knowledge, and grow together</p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="card-3d animate-fade-up animate-scale-in depth-effect shadow-3d rounded-2xl border border-gray-200 p-6 text-center hover:border-teal-200 transition-all"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Be Part of Something Special</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Our community is built on collaboration, support, and shared success. Whether you're looking to join a study circle or start your own, there's a place for you here.
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Join the Community
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
