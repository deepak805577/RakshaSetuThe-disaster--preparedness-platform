import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Contact {
  id: string;
  name: string;
  category: 'emergency' | 'disaster' | 'medical' | 'police' | 'fire' | 'school' | 'utility';
  phone: string;
  description: string;
  district?: string;
  address?: string;
  available24x7: boolean;
}

const EmergencyContactsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'emergency', label: 'Emergency Services' },
    { key: 'disaster', label: 'Disaster Management' },
    { key: 'medical', label: 'Medical Services' },
    { key: 'police', label: 'Police' },
    { key: 'fire', label: 'Fire Department' },
    { key: 'school', label: 'School Administration' },
    { key: 'utility', label: 'Utilities' }
  ];

  const districts = [
    'All Districts', 'Amritsar', 'Bathinda', 'Jalandhar', 'Ludhiana', 'Patiala', 'Mohali'
  ];

  const emergencyContacts: Contact[] = [
    {
      id: '1',
      name: 'Punjab Police Emergency',
      category: 'emergency',
      phone: '100',
      description: 'Emergency police services across Punjab',
      available24x7: true
    },
    {
      id: '2',
      name: 'Fire Emergency',
      category: 'emergency',
      phone: '101',
      description: 'Fire emergency services',
      available24x7: true
    },
    {
      id: '3',
      name: 'Medical Emergency (Ambulance)',
      category: 'emergency',
      phone: '108',
      description: 'Emergency medical services and ambulance',
      available24x7: true
    },
    {
      id: '4',
      name: 'Punjab State Disaster Management Authority',
      category: 'disaster',
      phone: '+91-172-2864014',
      description: 'State disaster management and coordination',
      address: 'Punjab Bhawan, Sector 1, Chandigarh',
      available24x7: true
    },
    {
      id: '5',
      name: 'Ludhiana District Collector',
      category: 'disaster',
      phone: '+91-161-2440004',
      description: 'District disaster management and administration',
      district: 'Ludhiana',
      available24x7: false
    },
    {
      id: '6',
      name: 'Amritsar Civil Hospital',
      category: 'medical',
      phone: '+91-183-2542636',
      description: 'Government hospital emergency services',
      district: 'Amritsar',
      address: 'Queens Road, Amritsar',
      available24x7: true
    },
    {
      id: '7',
      name: 'CMO Office Patiala',
      category: 'medical',
      phone: '+91-175-2212345',
      description: 'Chief Medical Officer - District health services',
      district: 'Patiala',
      available24x7: false
    },
    {
      id: '8',
      name: 'Punjab School Education Board',
      category: 'school',
      phone: '+91-175-2302095',
      description: 'State education board for school-related emergencies',
      address: 'Vidya Bhawan, Phase 8, Mohali',
      available24x7: false
    },
    {
      id: '9',
      name: 'PSEB Power Helpline',
      category: 'utility',
      phone: '1912',
      description: 'Punjab State Electricity Board emergency repairs',
      available24x7: true
    },
    {
      id: '10',
      name: 'Child Helpline',
      category: 'emergency',
      phone: '1098',
      description: 'Emergency helpline for children in distress',
      available24x7: true
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'disaster': return '🌪️';
      case 'medical': return '🏥';
      case 'police': return '👮';
      case 'fire': return '🚒';
      case 'school': return '🏫';
      case 'utility': return '⚡';
      default: return '📞';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'disaster': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medical': return 'bg-green-100 text-green-800 border-green-200';
      case 'police': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fire': return 'bg-red-100 text-red-800 border-red-200';
      case 'school': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'utility': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredContacts = emergencyContacts.filter(contact => {
    const categoryMatch = selectedCategory === 'all' || contact.category === selectedCategory;
    const districtMatch = selectedDistrict === 'all' || 
                         selectedDistrict === 'All Districts' || 
                         contact.district === selectedDistrict ||
                         !contact.district; // Include contacts without district restriction
    return categoryMatch && districtMatch;
  });

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
              <p className="text-gray-600 mt-2">Quick access to emergency services in Punjab</p>
            </div>
            <Link
              to="/"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Emergency Numbers */}
        <div className="bg-red-600 text-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Emergency Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">100</div>
              <div className="text-sm opacity-90">Police</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">101</div>
              <div className="text-sm opacity-90">Fire</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">108</div>
              <div className="text-sm opacity-90">Ambulance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1098</div>
              <div className="text-sm opacity-90">Child Helpline</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Emergency Contacts ({filteredContacts.length})
          </h2>
          
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📞</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contacts Found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more contacts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(contact.category)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          {contact.district && (
                            <p className="text-sm text-gray-500">{contact.district}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(contact.category)}`}>
                        {contact.category.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{contact.description}</p>

                    {contact.address && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {contact.address}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-gray-900">{contact.phone}</span>
                        {contact.available24x7 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">
                            24x7
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ Important Notice</h3>
          <ul className="space-y-2 text-yellow-700">
            <li>• For life-threatening emergencies, dial 100 (Police) or 108 (Medical Emergency)</li>
            <li>• Keep this list handy and share with family members</li>
            <li>• Report false emergency calls as they can be prosecuted</li>
            <li>• Some services may not be available 24x7 - check availability before calling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactsPage;
