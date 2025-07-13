import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Last updated:</strong> July 13, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing and using ReflectAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ReflectAI is an AI-powered mental wellness platform that provides personalized emotional support through intelligent, adaptive conversational experiences. The service includes journaling features, AI counselor interactions, goal tracking, and analytics.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Privacy and Data Protection</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your privacy is important to us. We collect and use your personal information in accordance with our Privacy Policy. By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>We use encryption to protect your personal data</li>
                <li>Journal entries are private and only accessible to you</li>
                <li>AI interactions are processed securely with content sanitization</li>
                <li>We do not share your personal information with third parties without consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Subscription and Billing</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ReflectAI offers both free and premium subscription plans:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Free Trial:</strong> New users receive a trial period to explore premium features</li>
                <li><strong>Pro Plan:</strong> Monthly or annual subscription with enhanced features and AI interaction limits</li>
                <li><strong>Unlimited Plan:</strong> Full access to all features with unlimited AI interactions</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Subscription fees are billed in advance on a monthly or annual basis. You may cancel your subscription at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Acceptable Use</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree not to use the service for any unlawful purpose or in any way that could damage, disable, or impair the service. Prohibited activities include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Sharing account credentials with others</li>
                <li>Attempting to reverse engineer or hack the service</li>
                <li>Using the service to harm others or promote illegal activities</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. AI and Mental Health Disclaimer</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Important:</strong> ReflectAI is not a substitute for professional mental health care. Our AI counselor is designed to provide supportive conversation and guidance, but it is not a replacement for licensed therapy or medical treatment.
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>If you are experiencing a mental health crisis, please contact emergency services or a mental health professional immediately</li>
                <li>The AI responses are generated based on patterns and should not be considered professional medical advice</li>
                <li>Always consult with qualified healthcare providers for serious mental health concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The service and its original content, features, and functionality are and will remain the exclusive property of ReflectAI and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                In no event shall ReflectAI be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us through our support channels within the application.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}