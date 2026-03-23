import { FileText, CheckCircle, Users, AlertTriangle, Shield, Lock, Ban, XCircle, Scale, RefreshCw, Mail, MapPin } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-6">
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Welcome to HealthTrack. These Terms of Service govern your use of our health monitoring platform and services. By accessing or using our services, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Acceptance of Terms</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              By creating an account or using HealthTrack, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our services.
            </p>
          </div>

          {/* Description of Service */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Description of Service</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              HealthTrack provides AI-powered health monitoring and risk assessment services, including:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Health data tracking and analysis
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Personalized health recommendations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Risk assessment reports
                </li>
              </ul>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Progress monitoring and goal setting
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Educational content and resources
                </li>
              </ul>
            </div>
          </div>

          {/* User Eligibility */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User Eligibility</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To use HealthTrack, you must:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Be at least 18 years old
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Have the legal capacity to enter into these Terms
                </li>
              </ul>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Provide accurate and complete information
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Maintain the confidentiality of your account credentials
                </li>
              </ul>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User Responsibilities</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are responsible for:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Providing accurate health information
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Using the service in accordance with applicable laws
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Not sharing your account with others
                </li>
              </ul>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Reporting any security concerns promptly
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Understanding that our recommendations are not medical advice
                </li>
              </ul>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Medical Disclaimer</h2>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-6 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                <strong>IMPORTANT:</strong>
              </p>
              <p className="text-red-700 dark:text-red-300">
                HealthTrack is not a substitute for professional medical advice, diagnosis, or treatment. Our AI-powered insights and recommendations are for informational purposes only. Always consult with qualified healthcare professionals for medical decisions and before making significant changes to your health regimen.
              </p>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Lock className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Privacy and Security</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your privacy is important to us. We collect, use, and protect your personal and health information in accordance with our Privacy Policy. We implement industry-standard security measures to protect your data, but no system is completely secure.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Intellectual Property</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                All content, features, and functionality of HealthTrack are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Ban className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prohibited Uses</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                You agree not to:
              </p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                <li>• Use the service for any illegal purposes</li>
                <li>• Attempt to gain unauthorized access to our systems</li>
                <li>• Interfere with the proper functioning of the service</li>
                <li>• Upload malicious code or content</li>
                <li>• Misrepresent your identity or qualifications</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Termination</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for other reasons we deem necessary. You may also terminate your account at any time.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Limitation of Liability</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                To the maximum extent permitted by law, HealthTrack shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Changes to Terms</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We may update these Terms from time to time. We will notify you of material changes via email or through our platform. Your continued use of the service after such changes constitutes acceptance of the new Terms.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Governing Law</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                These Terms are governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contact Information</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
              <Mail className="w-5 h-5 mr-3 text-purple-500" />
              <span>legal@healthtrack.com</span>
            </div>
            <div className="flex items-start text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5 mr-3 text-purple-500 mt-0.5" />
              <span>123 Health Street<br />Medical District<br />New York, NY 10001</span>
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

export default TermsOfService;
