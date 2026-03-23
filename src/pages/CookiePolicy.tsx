import { Cookie, Settings, BarChart3, Sliders, Shield, Users, RefreshCw, Mail } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <Cookie className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            This Cookie Policy explains how HealthTrack uses cookies and similar technologies to enhance your experience on our platform.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* What Are Cookies */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Cookie className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">What Are Cookies</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and understanding how you use our platform.
            </p>
          </div>

          {/* Types of Cookies We Use */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Types of Cookies We Use</h2>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-red-500 pl-6">
                <div className="flex items-center mb-3">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Essential Cookies</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies without severely affecting the functionality of our platform.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Analytics Cookies</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience. The information collected is aggregated and anonymous.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <div className="flex items-center mb-3">
                  <Sliders className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Functional Cookies</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  These cookies remember your preferences and settings, such as language selection and login status, to provide a more personalized experience.
                </p>
              </div>
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Managing Cookies</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You can control and manage cookies in various ways:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Most web browsers allow you to control cookies through their settings
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You can delete all cookies that are already on your computer
                </li>
              </ul>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You can set most browsers to prevent cookies from being placed
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You can opt out of analytics cookies through our cookie consent banner
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Third-Party Cookies</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Some cookies may be set by third-party services that appear on our pages. We have no control over these cookies, and they are subject to the respective third party's privacy policy.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <RefreshCw className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Updates to This Policy</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contact Us</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Mail className="w-5 h-5 mr-3 text-green-500" />
              <span>privacy@healthtrack.com</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Last updated: November 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
