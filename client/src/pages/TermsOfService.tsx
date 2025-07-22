import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/app/counselor" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Counselor
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your privacy is fundamental to our service. This privacy policy explains how we collect, use, protect, and share your personal information when you use ReflectAI.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information We Collect</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Account Information:</strong> Username, email address, and encrypted password</li>
                <li><strong>Journal Content:</strong> Your personal reflections, mood data, and journal entries</li>
                <li><strong>Usage Data:</strong> How you interact with our app, features used, and session information</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through our payment partners</li>
                <li><strong>AI Interactions:</strong> Conversations with our AI counselor for improving responses</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How We Use Your Information</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Provide personalized AI counseling and journal insights</li>
                <li>Maintain and improve our service quality and features</li>
                <li>Process payments and manage your subscription</li>
                <li>Send important service updates and security notifications</li>
                <li>Analyze usage patterns to enhance user experience (anonymized)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Protection and Security</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Encryption:</strong> All journal entries and personal data are encrypted at rest and in transit</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view your data internally</li>
                <li><strong>AI Privacy:</strong> Content is sanitized before AI processing to remove identifying information</li>
                <li><strong>Secure Infrastructure:</strong> We use industry-standard security practices and trusted hosting providers</li>
                <li><strong>Regular Audits:</strong> Our security practices are regularly reviewed and updated</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Sharing and Third Parties</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>No Sale of Data:</strong> We never sell your personal information to third parties</li>
                <li><strong>Service Providers:</strong> Limited sharing with trusted partners (payment processing, hosting, AI services)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect rights and safety</li>
                <li><strong>User Consent:</strong> Any other sharing requires your explicit consent</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Rights and Controls</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Access:</strong> View and download your personal data and journal entries</li>
                <li><strong>Correction:</strong> Update or correct your personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Data Portability:</strong> Export your journal data in standard formats</li>
                <li><strong>Opt-out:</strong> Control marketing communications and data processing preferences</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Retention</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Active accounts: Data retained as long as your account is active</li>
                <li>Deleted accounts: Personal data removed within 30 days of account deletion</li>
                <li>Legal requirements: Some data may be retained longer for legal or regulatory compliance</li>
                <li>Anonymized data: May be retained for service improvement and analytics</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Children's Privacy</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ReflectAI is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we will delete it promptly.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">International Users</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you are accessing ReflectAI from outside the United States, please note that your information may be transferred to and processed in the United States, where our servers are located.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Privacy Policy Updates</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this privacy policy periodically. We will notify you of significant changes through the app or email. Your continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Subscription and Billing</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ReflectAI offers premium subscription plans:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Basic Plan:</strong> Essential features for getting started with AI counseling</li>
                <li><strong>Pro Plan:</strong> Monthly or annual subscription with enhanced features and AI interaction limits</li>
                <li><strong>Elite Plan:</strong> Full access to all features with unlimited AI interactions and premium support</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Subscription fees are billed in advance on a monthly or annual basis. You may cancel your subscription at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Free Trial & Billing Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We want you to experience ReflectAI risk-free. Our free trial policy is designed to give you full access before committing:
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Free Trial Details</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>7-Day Free Trial:</strong> All subscription plans include a 7-day free trial period with full access to features</li>
                <li><strong>No Upfront Payment:</strong> You will not be charged during the trial period</li>
                <li><strong>Easy Cancellation:</strong> Cancel anytime during the trial to avoid any charges</li>
                <li><strong>Automatic Billing:</strong> After the trial ends, billing begins automatically unless cancelled</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Billing & Cancellation</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Billing starts after your 7-day free trial ends</li>
                <li>You can cancel your subscription anytime through your account settings or by contacting support</li>
                <li>Cancelled subscriptions remain active until the end of the current billing period</li>
                <li>No refunds are provided for partial billing periods as the free trial allows full evaluation</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Trial Policy</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>One free trial per user - additional trials may be denied for the same user or payment method</li>
                <li>Trial cancellations must be completed before the trial period ends to avoid charges</li>
                <li>Users who violate our Terms of Service may have trial access revoked</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Acceptable Use</h2>
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. AI and Mental Health Disclaimer</h2>
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The service and its original content, features, and functionality are and will remain the exclusive property of ReflectAI and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                In no event shall ReflectAI be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Contact Information</h2>
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