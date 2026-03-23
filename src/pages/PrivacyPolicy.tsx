import { Shield, Database, Eye, Lock, Share2, UserCheck, Clock, Globe, Users, RefreshCw, Mail, MapPin } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            At HealthTrack, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Information We Collect */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-6">
                <div className="flex items-center mb-3">
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Personal Information</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We collect personal information that you provide directly to us, including:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Name and contact information
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Health data and medical history (with your explicit consent)
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Account credentials and preferences
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Communication records with our support team
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <div className="flex items-center mb-3">
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Automatically Collected Information</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  When you use our platform, we automatically collect certain information, including:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Device information and browser type
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    IP address and location data
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Usage patterns and platform interactions
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Cookies and similar tracking technologies
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the collected information for the following purposes:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Providing and improving our health monitoring services
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Personalizing your experience and recommendations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Communicating with you about your account and our services
                </li>
              </ul>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ensuring platform security and preventing fraud
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Complying with legal obligations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Conducting research and analytics to improve our services
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Security</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We implement robust security measures to protect your personal information:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Encryption of data in transit and at rest
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Regular security audits and updates
                </li>
              </ul>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Access controls and authentication requirements
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Secure data storage and backup procedures
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Share2 className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Sharing and Disclosure</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations</li>
                <li>• To protect our rights and prevent fraud</li>
                <li>• With trusted service providers</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Rights</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                <li>• Access to your personal data</li>
                <li>• Correction of inaccurate information</li>
                <li>• Deletion of your data</li>
                <li>• Data portability</li>
                <li>• Opt-out of marketing communications</li>
                <li>• Withdraw consent for data processing</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Retention</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We retain your personal information only as long as necessary for the purposes outlined in this policy, or as required by law. When information is no longer needed, we securely delete or anonymize it.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-pink-600 dark:text-pink-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">International Data Transfers</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your data may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Children's Privacy</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.
              </p>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contact Us</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
              <Mail className="w-5 h-5 mr-3 text-blue-500" />
              <span>privacy@healthtrack.com</span>
            </div>
            <div className="flex items-start text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5 mr-3 text-blue-500 mt-0.5" />
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

export default PrivacyPolicy;
