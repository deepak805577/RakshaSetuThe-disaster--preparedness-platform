import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DisasterModule } from '../../types';
import { moduleService } from '../../services/moduleService';

const ModulesPage: React.FC = () => {
  const [modules, setModules] = useState<DisasterModule[]>([]);
  const [filteredModules, setFilteredModules] = useState<DisasterModule[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const disasterTypes = [
    { value: 'all', label: 'All Disasters', color: 'bg-gray-100 text-gray-800' },
    { value: 'earthquake', label: 'Earthquake', color: 'bg-red-100 text-red-800' },
    { value: 'flood', label: 'Flood', color: 'bg-blue-100 text-blue-800' },
    { value: 'fire', label: 'Fire', color: 'bg-orange-100 text-orange-800' },
    { value: 'cyclone', label: 'Cyclone', color: 'bg-purple-100 text-purple-800' },
    { value: 'drought', label: 'Drought', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'heatwave', label: 'Heatwave', color: 'bg-pink-100 text-pink-800' }
  ];

  const difficultyLevels = [
    { value: 'all', label: 'All Levels', color: 'bg-gray-100 text-gray-800' },
    { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    const loadModules = async () => {
      setIsLoading(true);
      
      try {
        const modules = await moduleService.getAllModules();
        console.log('✅ ModulesPage: Loaded modules from API:', modules);
        console.log('✅ ModulesPage: Module count:', modules.length);
        
        // Check if modules have videos
        modules.forEach(module => {
          const videoCount = module.content?.videos?.length || 0;
          console.log(`✅ Module "${module.title}" has ${videoCount} videos`);
        });
        
        setModules(modules);
        setFilteredModules(modules);
        setIsLoading(false);
        return; // Exit successfully, don't use mock data
      } catch (error) {
        console.error('❌ ModulesPage: Error loading modules from API:', error);
        console.warn('⚠️ ModulesPage: Falling back to mock data - this means videos won\'t be visible!');
        
        // Fallback to mock data if API fails
        const mockModules: DisasterModule[] = [
          {
            _id: '1',
            title: 'Earthquake Preparedness',
            description: 'Learn how to prepare for and respond to earthquakes in Punjab schools.',
            type: 'earthquake',
            difficulty: 'beginner',
            content: {
              introduction: 'Earthquakes can occur without warning...',
              keyPoints: ['Drop, Cover, and Hold On', 'Identify safe spots', 'Create emergency kit'],
              preventionMeasures: ['Secure heavy furniture', 'Practice drills regularly'],
              duringDisaster: ['Stay calm', 'Take cover under sturdy furniture'],
              afterDisaster: ['Check for injuries', 'Evacuate if necessary']
            },
            quiz: {
              questions: [],
              passingScore: 70
            },
            completions: 1250,
            ratings: 4.8,
            estimatedTime: 30,
            totalQuizPoints: 100
          },
          {
            _id: '2',
            title: 'Flood Safety Guidelines',
            description: 'Comprehensive guide to flood preparedness and safety measures.',
            type: 'flood',
            difficulty: 'intermediate',
            content: {
              introduction: 'Floods are common in Punjab during monsoon...',
              keyPoints: ['Monitor weather alerts', 'Avoid floodwaters', 'Have evacuation plan'],
              preventionMeasures: ['Keep emergency supplies ready', 'Know evacuation routes'],
              duringDisaster: ['Move to higher ground', 'Avoid walking through floodwaters'],
              afterDisaster: ['Return only when safe', 'Check for damage']
            },
            quiz: {
              questions: [],
              passingScore: 75
            },
            completions: 980,
            ratings: 4.6,
            estimatedTime: 25,
            totalQuizPoints: 120
          },
          {
            _id: '3',
            title: 'Fire Safety and Evacuation',
            description: 'Essential fire safety knowledge and evacuation procedures.',
            type: 'fire',
            difficulty: 'beginner',
            content: {
              introduction: 'Fire safety is crucial in school environments...',
              keyPoints: ['Know fire exits', 'Use fire extinguishers', 'Stop, Drop, and Roll'],
              preventionMeasures: ['Keep exits clear', 'Check smoke detectors'],
              duringDisaster: ['Sound the alarm', 'Evacuate immediately'],
              afterDisaster: ['Account for everyone', 'Call emergency services']
            },
            quiz: {
              questions: [],
              passingScore: 80
            },
            completions: 2100,
            ratings: 4.9,
            estimatedTime: 20,
            totalQuizPoints: 90
          },
          {
            _id: '4',
            title: 'Cyclone Preparedness',
            description: 'How to prepare for and respond to cyclonic storms.',
            type: 'cyclone',
            difficulty: 'advanced',
            content: {
              introduction: 'Cyclones can bring strong winds and heavy rain...',
              keyPoints: ['Monitor weather updates', 'Secure outdoor objects', 'Stay indoors'],
              preventionMeasures: ['Prepare emergency kit', 'Know evacuation routes'],
              duringDisaster: ['Stay away from windows', 'Take shelter in interior room'],
              afterDisaster: ['Wait for all-clear signal', 'Check for damage']
            },
            quiz: {
              questions: [],
              passingScore: 85
            },
            completions: 650,
            ratings: 4.7,
            estimatedTime: 35,
            totalQuizPoints: 150
          },
          {
            _id: '5',
            title: 'Drought Management',
            description: 'Understanding drought conditions and water conservation.',
            type: 'drought',
            difficulty: 'intermediate',
            content: {
              introduction: 'Drought affects water availability and agriculture...',
              keyPoints: ['Conserve water', 'Monitor water levels', 'Plan for shortages'],
              preventionMeasures: ['Use water efficiently', 'Store emergency water'],
              duringDisaster: ['Limit water usage', 'Follow restrictions'],
              afterDisaster: ['Continue conservation', 'Assess damage']
            },
            quiz: {
              questions: [],
              passingScore: 70
            },
            completions: 420,
            ratings: 4.4,
            estimatedTime: 28,
            totalQuizPoints: 110
          },
          {
            _id: '6',
            title: 'Heatwave Safety',
            description: 'Protecting yourself and others during extreme heat conditions.',
            type: 'heatwave',
            difficulty: 'beginner',
            content: {
              introduction: 'Heatwaves can be dangerous, especially for children...',
              keyPoints: ['Stay hydrated', 'Avoid direct sun', 'Recognize heat illness'],
              preventionMeasures: ['Drink plenty of water', 'Wear light clothing'],
              duringDisaster: ['Stay in cool places', 'Use fans or AC'],
              afterDisaster: ['Continue monitoring', 'Check on vulnerable people']
            },
            quiz: {
              questions: [],
              passingScore: 75
            },
            completions: 780,
            ratings: 4.5,
            estimatedTime: 22,
            totalQuizPoints: 95
          }
        ];

        setModules(mockModules);
        setFilteredModules(mockModules);
      } finally {
        setIsLoading(false);
      }
    };

    loadModules();
  }, []);

  useEffect(() => {
    let filtered = modules;

    if (selectedType !== 'all') {
      filtered = filtered.filter(module => module.type === selectedType);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(module => module.difficulty === selectedDifficulty);
    }

    setFilteredModules(filtered);
  }, [modules, selectedType, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earthquake': return '🌍';
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'cyclone': return '🌪️';
      case 'drought': return '☀️';
      case 'heatwave': return '🌡️';
      default: return '⚠️';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">Disaster Preparedness Modules</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Learn how to prepare for and respond to various disasters that can affect Punjab schools.
            Build essential skills to keep yourself and others safe during emergencies.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Filter Modules</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Disaster Type Filter */}
            <div className="text-center">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                📋 Disaster Type
              </label>
              <div className="flex flex-wrap justify-center gap-3">
                {disasterTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      selectedType === type.value
                        ? `${type.color} shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="text-center">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                🏆 Difficulty Level
              </label>
              <div className="flex flex-wrap justify-center gap-3">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedDifficulty(level.value)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      selectedDifficulty === level.value
                        ? `${level.color} shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredModules.map((module) => (
            <div key={module._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="p-8">
                {/* Module Header */}
                <div className="text-center mb-6">
                  <div className="mb-4">
                    <span className="text-4xl mb-3 block">{getTypeIcon(module.type)}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{module.title}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6 text-center leading-relaxed">{module.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-center mb-1">
                      <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">{module.estimatedTime} min</span>
                    </div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-center mb-1">
                      <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">{module.completions?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 mx-0.5 ${
                          star <= Math.floor(module.ratings || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {module.ratings} • {module.completions?.toLocaleString()} students
                  </span>
                </div>

                {/* Points */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {module.totalQuizPoints} points available
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/modules/${module._id}`}
                  className="block w-full bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg"
                >
                  🚀 Start Learning
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to see more modules.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedDifficulty('all');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulesPage;
