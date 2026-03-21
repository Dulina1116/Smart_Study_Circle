import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Terms of <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-lg text-gray-600">Last updated: March 2024</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 mb-8">
              These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Smart Study Circle ("we," "us," or "our"), concerning your access to and use of the Smart Study Circle website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
            <p className="text-gray-600 mb-4">By using our service, you agree to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-8">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the confidentiality of your password and account information</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Not engage in any conduct that restricts or inhibits anyone's use or enjoyment of the website</li>
              <li>Not post or upload content that is unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
            <p className="text-gray-600 mb-8">
              Unless otherwise indicated, the site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the site (collectively, the "Content") are owned or controlled by us or licensed to us.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">User-Generated Content</h2>
            <p className="text-gray-600 mb-8">
              By posting, displaying, or transmitting any content (including text, images, and any other materials) using our service, you grant us a license to use, copy, modify, and distribute such content in connection with operating and improving the website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 mb-8">
              IN NO EVENT SHALL COMPANY BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE MATERIALS ON OUR WEBSITE.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications to Terms</h2>
            <p className="text-gray-600 mb-8">
              We may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms and Conditions, please contact us at: legal@smartstudycircle.com
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
