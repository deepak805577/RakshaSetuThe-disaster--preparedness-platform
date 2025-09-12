import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpCenterPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'modules', name: 'Learning Modules', icon: '📖' },
    { id: 'drills', name: 'Virtual Drills', icon: '🏃' },
    { id: 'account', name: 'Account & Profile', icon: '👤' },
    { id: 'technical', name: 'Technical Issues', icon: '🔧' },
    { id: 'safety', name: 'Safety Guidelines', icon: '🛡️' },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I get started with the platform?',
      answer: 'To get started, create an account by clicking the "Register" button. Once registered, you can access learning modules, participate in virtual drills, and track your progress through the dashboard.',
      category: 'getting-started'
    },
    {
      id: '2',
      question: 'What are learning modules?',
      answer: 'Learning modules are interactive educational content covering various disaster types like earthquakes, floods, fires, and more. Each module includes videos, key information, and a quiz to test your knowledge.',
      category: 'modules'
    },
    {
      id: '3',
      question: 'How do virtual drills work?',
      answer: 'Virtual drills simulate real disaster scenarios where you practice emergency procedures step-by-step. You\'ll receive real-time feedback and scores based on your response time and accuracy.',
      category: 'drills'
    },
    {
      id: '4',
      question: 'How can I track my progress?',
      answer: 'Your progress is automatically tracked and displayed on your dashboard. You can see completed modules, drill scores, earned badges, and your position on the leaderboard.',
      category: 'account'
    },
    {
      id: '5',
      question: 'What should I do if videos are not playing?',
      answer: 'If videos aren\'t playing, check your internet connection, try refreshing the page, or clear your browser cache. Make sure your browser is up-to-date and JavaScript is enabled.',
      category: 'technical'
    },
    {
      id: '6',
      question: 'How do I earn badges?',
      answer: 'Badges are earned by completing modules, achieving high quiz scores, participating in drills, and reaching various milestones. Check the Badges page to see all available badges and their requirements.',
      category: 'modules'
    },
    {
      id: '7',
      question: 'Can teachers monitor student progress?',
      answer: 'Yes, teachers have access to a special dashboard where they can monitor their students\' progress, view completion rates, and generate reports for their classes.',
      category: 'account'
    },
    {
      id: '8',
      question: 'What is the Drop, Cover, and Hold On technique?',
      answer: 'This is the recommended earthquake safety action: DROP to your hands and knees, take COVER under a desk or table, and HOLD ON to your shelter until the shaking stops.',
      category: 'safety'
    },
    {
      id: '9',
      question: 'How often should we practice emergency drills?',
      answer: 'Schools should conduct fire drills monthly and earthquake drills at least twice per year. Regular practice ensures everyone knows the procedures and can act quickly in real emergencies.',
      category: 'safety'
    },
    {
      id: '10',
      question: 'What emergency supplies should schools maintain?',
      answer: 'Schools should maintain first aid kits, water (1 gallon per person per day for 3 days), non-perishable food, flashlights, battery-powered radios, and emergency contact lists.',
      category: 'safety'
    },
    {
      id: '11',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.',
      category: 'account'
    },
    {
      id: '12',
      question: 'Can I retake quizzes?',
      answer: 'Yes, you can retake quizzes to improve your score. Each attempt will show different questions from the module\'s question pool to enhance learning.',
      category: 'modules'
    },
    {
      id: '13',
      question: 'What browsers are supported?',
      answer: 'The platform works best on modern browsers like Chrome, Firefox, Safari, and Edge. Please ensure your browser is updated to the latest version for optimal performance.',
      category: 'technical'
    },
    {
      id: '14',
      question: 'How do I report a technical issue?',
      answer: 'You can report issues through the "Report Issue" page in the footer, or contact our support team directly through the Contact Us page.',
      category: 'technical'
    },
    {
      id: '15',
      question: 'Is the platform available in other languages?',
      answer: 'Currently, the platform is available in English. We are working on adding Punjabi and Hindi language support in future updates.',
      category: 'getting-started'
    }
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and learn how to make the most of our disaster preparedness platform.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/contact" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">Contact Support</h3>
            </div>
            <p className="text-gray-600">Get in touch with our support team for personalized assistance.</p>
          </Link>

          <Link to="/modules" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">User Guide</h3>
            </div>
            <p className="text-gray-600">Explore our comprehensive guides and tutorials.</p>
          </Link>

          <Link to="/emergency-contacts" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">Emergency Help</h3>
            </div>
            <p className="text-gray-600">Access emergency contact numbers and procedures.</p>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No questions found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map(faq => (
                <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${
                        expandedItems.includes(faq.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedItems.includes(faq.id) && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="mb-6">Our support team is here to assist you with any questions or concerns.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/report-issue"
              className="px-6 py-3 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
