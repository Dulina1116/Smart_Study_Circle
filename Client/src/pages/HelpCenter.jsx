import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";

export default function HelpCenter() {
  const faqs = [
    {
      q: "How do I create a study circle?",
      a: "Click on 'Create Circle' from your dashboard, add a name, subject, and invite friends or classmates. You can set schedules and goals for your group.",
    },
    {
      q: "Can I join multiple study circles?",
      a: "Yes! You can join as many circles as you want. Manage all your circles from your dashboard and switch between them easily.",
    },
    {
      q: "How do I share study materials?",
      a: "Within any circle, use the 'Share Resources' feature. You can upload notes, documents, links, and other materials for your group.",
    },
    {
      q: "What if I need faculty help?",
      a: "Use the 'Request Faculty Alert' feature when specialized help is needed. Your assigned lecturer will be notified discreetly.",
    },
    {
      q: "How secure is my data?",
      a: "We use bank-level encryption for all user data. Your personal information is never shared and is protected by strict privacy policies.",
    },
    {
      q: "Can I schedule live focus sessions?",
      a: "Yes! Create focus rooms with specific time slots, topics, and role assignments. Members can see all upcoming sessions.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <span className="inline-block mb-4 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
              ❓ Got Questions?
            </span>
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Help <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-lg text-gray-600">Find answers to common questions and get support</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="space-y-4 mb-16">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="card-3d animate-fade-up depth-effect shadow-3d rounded-xl border border-gray-200 p-6 hover:border-teal-200 transition-all"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 ml-8">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Still need help?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="text-center">
                <Mail className="h-8 w-8 text-teal-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">support@smartstudycircle.com</p>
                <button className="text-teal-600 hover:text-teal-700 font-semibold">Send Email</button>
              </div>
              <div className="text-center">
                <MessageSquare className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our support team</p>
                <button className="text-cyan-600 hover:text-cyan-700 font-semibold">Start Chat</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
