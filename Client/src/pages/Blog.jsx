import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function Blog() {
  const articles = [
    {
      title: "How to Start Your First Study Circle",
      author: "Sarah Chen",
      date: "Mar 15, 2024",
      excerpt: "Learn the essential steps to create and manage a productive study group with your classmates.",
      category: "Getting Started",
      readTime: "5 min read",
    },
    {
      title: "The Science Behind Collaborative Learning",
      author: "Dr. James Wilson",
      date: "Mar 12, 2024",
      excerpt: "Discover research-backed evidence showing why peer teaching improves retention and understanding.",
      category: "Research",
      readTime: "8 min read",
    },
    {
      title: "Tools to Maximize Your Focus Sessions",
      author: "Emily Rodriguez",
      date: "Mar 10, 2024",
      excerpt: "Explore the best apps, techniques, and settings to eliminate distractions during study time.",
      category: "Productivity",
      readTime: "6 min read",
    },
    {
      title: "Student Success Stories: Real Transformations",
      author: "Marcus Johnson",
      date: "Mar 8, 2024",
      excerpt: "Read inspiring stories from students who improved their grades through Smart Study Circle.",
      category: "Success Stories",
      readTime: "7 min read",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <span className="inline-block mb-4 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
              ✍️ Latest Updates
            </span>
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Smart Study <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-lg text-gray-600">Tips, insights, and stories from our community</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="space-y-6">
            {articles.map((article, idx) => (
              <div
                key={idx}
                className="card-3d animate-fade-up depth-effect shadow-3d rounded-2xl border border-gray-200 p-6 sm:p-8 hover:border-teal-200 hover:shadow-lg transition-all"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                        {article.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h2>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {article.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {article.date}
                  </div>
                  <span>{article.readTime}</span>
                  <button className="ml-auto text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 group">
                    Read More <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
