import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { BookOpen, Download, Play } from "lucide-react";

export default function StudyGuides() {
  const guides = [
    {
      title: "Effective Note-Taking Strategies",
      description: "Master the Cornell Method, Outline Method, and Mind Mapping to capture information efficiently.",
      icon: BookOpen,
      downloads: 1024,
    },
    {
      title: "Time Management for Students",
      description: "Learn how to balance studies, activities, and personal time with proven productivity techniques.",
      icon: BookOpen,
      downloads: 856,
    },
    {
      title: "Exam Preparation Guide",
      description: "Comprehensive strategies for last-minute revision, managing exam anxiety, and scoring well.",
      icon: BookOpen,
      downloads: 1250,
    },
    {
      title: "Group Study Best Practices",
      description: "Optimize collaborative learning with structured discussions, resource sharing, and peer teaching.",
      icon: BookOpen,
      downloads: 742,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <span className="inline-block mb-4 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
              📚 Free Resources
            </span>
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Study <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Guides</span>
            </h1>
            <p className="text-lg text-gray-600">Expert-crafted guides to help you succeed academically</p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {guides.map((guide, idx) => (
              <div
                key={idx}
                className="card-3d animate-fade-up animate-scale-in depth-effect shadow-3d rounded-2xl border border-gray-200 p-6 hover:border-teal-200 transition-all"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100">
                    <BookOpen className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{guide.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{guide.downloads} downloads</span>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 font-semibold text-white hover:shadow-lg transition-shadow">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
