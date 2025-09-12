import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DisasterModule } from '../../types';
import VideoPlayer from '../../components/common/VideoPlayer';
import { moduleService } from '../../services/moduleService';

const ModuleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<DisasterModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'videos' | 'quiz'>('overview');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadModule = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        console.log('✅ ModuleDetailPage: Attempting to load module with ID:', id);
        const module = await moduleService.getModuleById(id);
        console.log('✅ ModuleDetailPage: Loaded module from API:', module);
        console.log('✅ ModuleDetailPage: Module content:', module.content);
        console.log('✅ ModuleDetailPage: Module content videos:', module.content?.videos);
        
        if ((module as any).videos) {
          console.log('✅ ModuleDetailPage: Module has', (module as any).videos.length, 'videos:', (module as any).videos.map((v: any) => v.title));
        } else if (module.content?.videos) {
          console.log('✅ ModuleDetailPage: Module has', module.content.videos.length, 'videos in content.videos:', module.content.videos.map((v: any) => v.title));
        } else {
          console.log('⚠️ ModuleDetailPage: Module has NO videos in either module.videos or content.videos');
        }
        
        setModule(module);
        setProgress(25); // You might want to fetch actual progress from API
        return; // Exit here - don't fall back to mock data
      } catch (error) {
        console.error('❌ ModuleDetailPage: Error loading module from API:', error);
        
        // Try to fetch all modules and find the one we need
        try {
          const allModules = await moduleService.getAllModules();
          const foundModule = allModules.find(m => m._id === id);
          if (foundModule) {
            console.log('✅ Found module in all modules list:', foundModule);
            setModule(foundModule);
            setProgress(25);
            return;
          }
        } catch (error2) {
          console.error('❌ Error loading all modules:', error2);
        }
        
        // Last resort: fallback to mock data
        const mockModule: DisasterModule = {
          _id: id || '1',
          title: 'Earthquake Preparedness',
          description: 'Learn how to prepare for and respond to earthquakes in Punjab schools. This comprehensive module covers everything from basic safety measures to advanced emergency response techniques.',
          type: 'earthquake',
          difficulty: 'beginner',
          content: {
            introduction: 'Earthquakes can occur without warning and can cause significant damage to buildings and infrastructure. In Punjab, while earthquakes are less frequent than in other regions, it\'s crucial for schools to be prepared. This module will teach you essential earthquake safety measures, evacuation procedures, and how to protect yourself and others during an earthquake.',
            keyPoints: [
              'Drop, Cover, and Hold On - The most important action during an earthquake',
              'Identify safe spots in your classroom and school building',
              'Create and maintain an emergency kit with essential supplies',
              'Practice earthquake drills regularly with your school community',
              'Know the evacuation routes and assembly points',
              'Stay calm and help others during the emergency'
            ],
            preventionMeasures: [
              'Secure heavy furniture, bookshelves, and equipment to walls',
              'Practice earthquake drills at least twice a year',
              'Keep emergency supplies readily available in each classroom',
              'Ensure all exit routes are clear and accessible',
              'Install earthquake-resistant fixtures where possible',
              'Regularly inspect and maintain school infrastructure'
            ],
            duringDisaster: [
              'Stay calm and immediately drop to the ground',
              'Take cover under a sturdy desk or table',
              'Hold on to the furniture and protect your head and neck',
              'Stay away from windows, mirrors, and heavy objects',
              'If outside, move to an open area away from buildings',
              'If in a vehicle, pull over and stop in a safe location'
            ],
            afterDisaster: [
              'Check yourself and others for injuries',
              'Evacuate the building if it\'s safe to do so',
              'Use stairs, not elevators',
              'Go to the designated assembly area',
              'Account for all students and staff',
              'Wait for further instructions from authorities'
            ],
            images: [
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
              'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500'
            ],
          videos: [
            {
              id: 'eq_intro',
              title: 'Understanding Earthquakes in Punjab',
              description: 'Learn about seismic zones and earthquake basics in Punjab region',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
              duration: 180,
              section: 'introduction'
            },
            {
              id: 'eq_drop_cover_hold',
              title: 'Drop, Cover, and Hold On Technique',
              description: 'Animated demonstration of the proper earthquake response technique',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500',
              duration: 120,
              section: 'duringDisaster'
            },
            {
              id: 'eq_school_evacuation',
              title: 'School Evacuation Procedures',
              description: 'Step-by-step guide for safe school evacuation during earthquakes',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
              duration: 240,
              section: 'duringDisaster'
            },
            {
              id: 'eq_emergency_kit',
              title: 'Building Your Emergency Kit',
              description: 'Essential items for earthquake preparedness and family emergency planning',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
              duration: 210,
              section: 'preventionMeasures'
            }
          ]
          },
          quiz: {
            questions: [
              {
                id: '1',
                question: 'What is the most important action to take during an earthquake?',
                options: [
                  'Run to the nearest exit',
                  'Drop, Cover, and Hold On',
                  'Stand in a doorway',
                  'Go outside immediately'
                ],
                correctAnswer: 1,
                explanation: 'Drop, Cover, and Hold On is the recommended action because it protects you from falling objects and provides stability.',
                points: 20
              },
              {
                id: '2',
                question: 'Where should you take cover during an earthquake?',
                options: [
                  'Under a sturdy desk or table',
                  'In a doorway',
                  'Near windows',
                  'In the center of the room'
                ],
                correctAnswer: 0,
                explanation: 'A sturdy desk or table provides the best protection from falling objects and debris.',
                points: 20
              }
            ],
            passingScore: 70
          },
          completions: 1250,
          ratings: 4.8,
          estimatedTime: 30,
          totalQuizPoints: 100
        };

        setModule(mockModule);
        setProgress(25); // Simulate user progress
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
  }, [id]);

  // Set selectedVideo when module is loaded
  useEffect(() => {
    if (module && module.content.videos && module.content.videos.length > 0) {
      setSelectedVideo(module.content.videos[0]);
    }
  }, [module]);

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
          <p className="mt-4 text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Module not found</h1>
          <Link to="/modules" className="text-red-600 hover:text-red-700">
            ← Back to modules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl mr-4">{getTypeIcon(module.type)}</span>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">{module.title}</h1>
                  <div className="flex items-center justify-center mt-3 space-x-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                    </span>
                    <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {module.estimatedTime} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {module.totalQuizPoints} points
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">{module.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{progress}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{module.completions?.toLocaleString()}</div>
                  <div className="text-sm font-medium text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{module.ratings}</div>
                  <div className="text-sm font-medium text-gray-600">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{module.totalQuizPoints}</div>
                  <div className="text-sm font-medium text-gray-600">Points Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex justify-center space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'content', label: 'Learning Content' },
                { id: 'videos', label: 'Video Lessons' },
                { id: 'quiz', label: 'Quiz' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h3>
                  <p className="text-gray-700 leading-relaxed text-lg max-w-4xl mx-auto">{module.content.introduction}</p>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Learning Points</h3>
                  <ul className="space-y-4 max-w-4xl mx-auto">
                    {module.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start justify-center">
                        <span className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-lg leading-relaxed flex-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-green-900 mb-4 text-center">🛡️ Prevention Measures</h3>
                    <ul className="space-y-3">
                      {module.content.preventionMeasures.map((measure, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mr-4 mt-2"></span>
                          <span className="text-green-800 text-base leading-relaxed">{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <h3 className="text-xl font-bold text-red-900 mb-4 text-center">⚠️ During Disaster</h3>
                    <ul className="space-y-3">
                      {module.content.duringDisaster.map((action, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mr-4 mt-2"></span>
                          <span className="text-red-800 text-base leading-relaxed">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Complete Learning Content</h3>
                  <p className="text-gray-600 mb-6">Study all the materials below to prepare for the quiz.</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Introduction</h4>
                    <p className="text-gray-600 leading-relaxed">{module.content.introduction}</p>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Key Points</h4>
                    <ul className="space-y-3">
                      {module.content.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-600">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Prevention Measures</h4>
                      <ul className="space-y-3">
                        {module.content.preventionMeasures.map((measure, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
                            <span className="text-gray-600 text-sm">{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">During Disaster</h4>
                      <ul className="space-y-3">
                        {module.content.duringDisaster.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>
                            <span className="text-gray-600 text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-8 border border-blue-200 max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold text-blue-900 mb-6 text-center">🛠️ After Disaster Recovery</h3>
                  <ul className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {module.content.afterDisaster.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mr-4 mt-2"></span>
                        <span className="text-blue-800 text-base leading-relaxed">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Video Lessons</h3>
                  <p className="text-gray-600 mb-6">
                    Watch these educational videos to better understand disaster preparedness techniques.
                  </p>
                </div>

                {/* Featured Video Player */}
                {selectedVideo && (
                  <div className="mb-8">
                    <VideoPlayer
                      src={selectedVideo.url}
                      poster={selectedVideo.thumbnail}
                      title={selectedVideo.title}
                      description={selectedVideo.description}
                      className="w-full h-96 mb-4"
                      onVideoEnd={() => {
                        // Track completion and possibly auto-advance to next video
                        console.log('Video completed:', selectedVideo.id);
                      }}
                      onVideoProgress={(current, duration) => {
                        // Track progress for analytics
                        const progress = (current / duration) * 100;
                        if (progress > 80) {
                          console.log('Video mostly watched:', selectedVideo.id);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Video Categories */}
                {!module.content.videos?.length ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Available</h3>
                    <p className="text-gray-600 mb-6">Video content is being prepared for this module. Please check back later or contact your instructor.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-blue-800">In the meantime, you can:</p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Review the learning content in the other tabs</li>
                        <li>• Take notes on the key concepts</li>
                        <li>• Discuss with your instructor</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                <div className="space-y-10">
                  {/* Introduction Videos */}
                  {(module.content.videos?.filter((video: any) => video.section === 'introduction').length || 0) > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-semibold mr-4 shadow-sm">
                          📚
                        </span>
                        Introduction & Basics
                        <span className="ml-auto bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                          {module.content.videos?.filter((video: any) => video.section === 'introduction').length} videos
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {module.content.videos
                          ?.filter((video: any) => video.section === 'introduction')
                          .map((video: any) => (
                            <div
                              key={video.id}
                              className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                                selectedVideo?.id === video.id 
                                  ? 'border-red-500 shadow-xl ring-2 ring-red-200 bg-red-50' 
                                  : 'border-gray-200 hover:border-blue-300 shadow-sm'
                              }`}
                              onClick={() => setSelectedVideo(video)}
                            >
                              <div className="relative mb-4 group">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-40 object-cover rounded-lg transition-all duration-300 group-hover:brightness-75"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x240/f3f4f6/6b7280?text=Video+Thumbnail';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center transition-all duration-300">
                                  <div className={`bg-red-600 text-white rounded-full p-3 transform transition-all duration-300 ${
                                    selectedVideo?.id === video.id ? 'scale-110 bg-red-700' : 'group-hover:scale-110'
                                  } shadow-lg`}>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </div>
                                {selectedVideo?.id === video.id && (
                                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                    Now Playing
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <h5 className={`font-semibold text-gray-900 line-clamp-2 leading-tight ${
                                  selectedVideo?.id === video.id ? 'text-red-900' : ''
                                }`}>
                                  {video.title}
                                </h5>
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                  {video.description}
                                </p>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prevention Videos */}
                  {(module.content.videos?.filter((video: any) => video.section === 'preventionMeasures').length || 0) > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-lg font-semibold mr-4 shadow-sm">
                          🛡️
                        </span>
                        Prevention & Preparedness
                        <span className="ml-auto bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                          {module.content.videos?.filter((video: any) => video.section === 'preventionMeasures').length} videos
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {module.content.videos
                          ?.filter((video: any) => video.section === 'preventionMeasures')
                          .map((video: any) => (
                            <div
                              key={video.id}
                              className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                selectedVideo?.id === video.id ? 'border-red-500 shadow-md' : 'border-gray-200'
                              }`}
                              onClick={() => setSelectedVideo(video)}
                            >
                              <div className="relative mb-3">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-32 object-cover rounded-md"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-md flex items-center justify-center">
                                  <div className="bg-red-600 bg-opacity-90 text-white rounded-full p-2">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </div>
                              </div>
                              <h5 className="font-medium text-gray-900 mb-1">{video.title}</h5>
                              <p className="text-sm text-gray-600">{video.description}</p>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* During Disaster Videos */}
                  {(module.content.videos?.filter((video: any) => video.section === 'duringDisaster').length || 0) > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-lg font-semibold mr-4 shadow-sm">
                          ⚠️
                        </span>
                        Emergency Response
                        <span className="ml-auto bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                          {module.content.videos?.filter((video: any) => video.section === 'duringDisaster').length} videos
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {module.content.videos
                          ?.filter((video: any) => video.section === 'duringDisaster')
                          .map((video: any) => (
                            <div
                              key={video.id}
                              className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                selectedVideo?.id === video.id ? 'border-red-500 shadow-md' : 'border-gray-200'
                              }`}
                              onClick={() => setSelectedVideo(video)}
                            >
                              <div className="relative mb-3">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-32 object-cover rounded-md"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-md flex items-center justify-center">
                                  <div className="bg-red-600 bg-opacity-90 text-white rounded-full p-2">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </div>
                              </div>
                              <h5 className="font-medium text-gray-900 mb-1">{video.title}</h5>
                              <p className="text-sm text-gray-600">{video.description}</p>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* After Disaster Videos */}
                  {(module.content.videos?.filter((video: any) => video.section === 'afterDisaster').length || 0) > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-lg font-semibold mr-4 shadow-sm">
                          🛠️
                        </span>
                        Recovery & Aftermath
                        <span className="ml-auto bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                          {module.content.videos?.filter((video: any) => video.section === 'afterDisaster').length} videos
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {module.content.videos
                          ?.filter((video: any) => video.section === 'afterDisaster')
                          .map((video: any) => (
                            <div
                              key={video.id}
                              className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                selectedVideo?.id === video.id ? 'border-red-500 shadow-md' : 'border-gray-200'
                              }`}
                              onClick={() => setSelectedVideo(video)}
                            >
                              <div className="relative mb-3">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-32 object-cover rounded-md"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-md flex items-center justify-center">
                                  <div className="bg-red-600 bg-opacity-90 text-white rounded-full p-2">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </div>
                              </div>
                              <h5 className="font-medium text-gray-900 mb-1">{video.title}</h5>
                              <p className="text-sm text-gray-600">{video.description}</p>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Learning Tips */}
                  <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mr-4 shadow-sm">
                        🎥
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-amber-900 mb-1">Video Learning Tips</h4>
                        <p className="text-amber-700 text-sm">Maximize your learning experience</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-50 rounded-lg">
                        <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          1
                        </div>
                        <p className="text-amber-800 text-sm font-medium">Watch each video completely for better understanding</p>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-50 rounded-lg">
                        <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          2
                        </div>
                        <p className="text-amber-800 text-sm font-medium">Take notes on key techniques and procedures</p>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-50 rounded-lg">
                        <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          3
                        </div>
                        <p className="text-amber-800 text-sm font-medium">Practice the techniques shown in the videos</p>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-50 rounded-lg">
                        <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          4
                        </div>
                        <p className="text-amber-800 text-sm font-medium">Discuss the content with your teachers and classmates</p>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-white bg-opacity-50 rounded-lg md:col-span-2">
                        <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          5
                        </div>
                        <p className="text-amber-800 text-sm font-medium">Review videos before taking the quiz to reinforce learning</p>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Quiz</h3>
                  <p className="text-gray-600 mb-4">
                    Test your knowledge with this quiz. You need to score at least {module.quiz.passingScore}% to pass.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          {module.quiz.questions.length} questions • {module.totalQuizPoints} points available
                        </p>
                        <p className="text-xs text-blue-600">
                          Passing score: {module.quiz.passingScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to={`/modules/${module._id}/quiz`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Start Quiz
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/modules"
            className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ← Back to Modules
          </Link>
          
          {activeTab === 'quiz' ? (
            <Link
              to={`/modules/${module._id}/quiz`}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Start Quiz
            </Link>
          ) : (
            <button
              onClick={() => setActiveTab('quiz')}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Take Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetailPage;
