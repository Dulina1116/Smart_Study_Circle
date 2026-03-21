import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Privacy <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-lg text-gray-600">Last updated: March 2024</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-8">
              Smart Study Circle ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-4">We may collect information about you in a variety of ways. The information we may collect on the site includes:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-8">
              <li>Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
              <li>Financial Data: Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date).</li>
              <li>Data From Third Parties: Information received from other sources such as your authentication provider.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Use of Your Information</h2>
            <p className="text-gray-600 mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-8">
              <li>Email you regarding your account or circle activity</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the site</li>
              <li>Generate a personal profile about you so that future visits to the site will be personalized</li>
              <li>Increase the efficiency and operation of the site</li>
              <li>Monitor and analyze usage and trends to improve your experience with the site</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclosure of Your Information</h2>
            <p className="text-gray-600 mb-8">
              We may share information we have collected about you in certain situations. Your information may be disclosed when required by law or when we believe in good faith that such action is necessary.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security of Your Information</h2>
            <p className="text-gray-600 mb-8">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions or comments about this Privacy Policy, please contact us at: privacy@smartstudycircle.com
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
