import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Cookie <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-lg text-gray-600">Last updated: March 2024</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 mb-8">
              Cookies are small data files that are placed on your computer or mobile device when you visit our website. They help us recognize you and enhance your browsing experience.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the website to function properly. They enable you to navigate the site and use its features, such as accessing secure areas.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Functional Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies enable our website to remember choices you have made (such as your username, language, or the region you are in) to provide more personalized features.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Targeting/Advertising Cookies</h3>
            <p className="text-gray-600 mb-8">
              These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts on other sites.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Control Cookies</h2>
            <p className="text-gray-600 mb-4">
              Most web browsers allow you to refuse cookies or alert you when cookies are being sent. However, blocking cookies may affect your ability to use certain features of our website. You can typically find cookie preferences in your browser settings.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600 mb-8">
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements on and off the site, and so forth.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about our use of cookies, please contact us at: privacy@smartstudycircle.com
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
