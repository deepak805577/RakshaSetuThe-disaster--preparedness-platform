import React, { useState, useEffect } from 'react';
import VideoPlayer from '../common/VideoPlayer';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  section: 'introduction' | 'preventionMeasures' | 'duringDisaster' | 'afterDisaster';
  moduleType: string;
  isActive: boolean;
  uploadDate: string;
}

const VideoManagement: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [availableModules, setAvailableModules] = useState<any[]>([]);

  const moduleTypes = ['earthquake', 'flood', 'fire', 'cyclone', 'heatwave', 'drought'];
  const sections = ['introduction', 'preventionMeasures', 'duringDisaster', 'afterDisaster'];

  useEffect(() => {
    loadVideos();
    loadAvailableModules();
  }, []);
  
  const loadAvailableModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/modules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableModules(data.data);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const loadVideos = async () => {
    setIsLoading(true);
    
    try {
      // Fetch videos from API
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Videos loaded from API:', data);
        
        // Transform API data to match component interface
        const transformedVideos: Video[] = data.data.map((video: any) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          url: video.url,
          thumbnail: video.thumbnail,
          duration: video.duration,
          section: video.section,
          moduleType: video.moduleType,
          isActive: video.isActive || true,
          uploadDate: new Date().toISOString().split('T')[0] // Default to today
        }));
        
        setVideos(transformedVideos);
        setIsLoading(false);
        return;
      } else {
        console.error('❌ API response not ok:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching videos from API:', error);
    }
    
    // Fallback to mock data if API fails
    console.log('⚠️ Falling back to mock data');
    const mockVideos: Video[] = [
      {
        id: 'eq_intro',
        title: 'Understanding Earthquakes in Punjab',
        description: 'Learn about seismic zones and earthquake basics in Punjab region',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        duration: 180,
        section: 'introduction',
        moduleType: 'earthquake',
        isActive: true,
        uploadDate: '2024-01-06'
      },
      {
        id: 'eq_drop_cover_hold',
        title: 'Drop, Cover, and Hold On Technique',
        description: 'Animated demonstration of the proper earthquake response technique',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500',
        duration: 120,
        section: 'duringDisaster',
        moduleType: 'earthquake',
        isActive: true,
        uploadDate: '2024-01-05'
      },
      {
        id: 'flood_intro',
        title: 'Understanding Floods in Punjab',
        description: 'Learn about monsoon patterns and river flood risks in Punjab',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500',
        duration: 200,
        section: 'introduction',
        moduleType: 'flood',
        isActive: true,
        uploadDate: '2024-01-04'
      },
      {
        id: 'fire_prevention',
        title: 'Fire Prevention in Schools and Homes',
        description: 'Learn how to prevent fires before they start',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1551954810-43cd6aef5b1f?w=500',
        duration: 240,
        section: 'preventionMeasures',
        moduleType: 'fire',
        isActive: true,
        uploadDate: '2024-01-03'
      }
    ];

    setTimeout(() => {
      setVideos(mockVideos);
      setIsLoading(false);
    }, 1000);
  };

  const filteredVideos = videos.filter(video => {
    const moduleMatch = filterModule === 'all' || video.moduleType === filterModule;
    const sectionMatch = filterSection === 'all' || video.section === filterSection;
    return moduleMatch && sectionMatch;
  });

  const handleToggleActive = (videoId: string) => {
    setVideos(videos.map(video => 
      video.id === videoId 
        ? { ...video, isActive: !video.isActive }
        : video
    ));
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Video deleted successfully');
        setVideos(videos.filter(video => video.id !== videoId));
        if (selectedVideo?.id === videoId) {
          setSelectedVideo(null);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error deleting video:', errorData);
        alert(`Failed to delete video: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Network error deleting video:', error);
      alert('Network error occurred while deleting video');
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'introduction': return '📚';
      case 'preventionMeasures': return '🛡️';
      case 'duringDisaster': return '⚠️';
      case 'afterDisaster': return '🛠️';
      default: return '📹';
    }
  };

  const getModuleIcon = (moduleType: string) => {
    switch (moduleType) {
      case 'earthquake': return '🌍';
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'cyclone': return '🌪️';
      case 'heatwave': return '🌡️';
      case 'drought': return '☀️';
      default: return '⚠️';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Management</h2>
          <p className="text-gray-600">Manage educational videos for disaster preparedness modules</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Video
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Module Type</label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Modules</option>
              {moduleTypes.map(type => (
                <option key={type} value={type}>
                  {getModuleIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>
                  {getSectionIcon(section)} {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Videos ({filteredVideos.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedVideo?.id === video.id ? 'bg-red-50 border-red-200' : ''
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {video.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{getModuleIcon(video.moduleType)} {video.moduleType}</span>
                        <span>•</span>
                        <span>{getSectionIcon(video.section)}</span>
                        <span>•</span>
                        <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          video.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {video.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Details */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {/* Video Player */}
                <div className="mb-6">
                  <VideoPlayer
                    src={selectedVideo.url}
                    poster={selectedVideo.thumbnail}
                    title={selectedVideo.title}
                    description={selectedVideo.description}
                    className="w-full h-64 md:h-80"
                  />
                </div>

                {/* Video Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{selectedVideo.title}</h3>
                      <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(selectedVideo.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedVideo.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {selectedVideo.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => console.log('Edit functionality not implemented yet')}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(selectedVideo.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Module</span>
                      <div className="text-lg font-semibold text-gray-900">
                        {getModuleIcon(selectedVideo.moduleType)} {selectedVideo.moduleType.charAt(0).toUpperCase() + selectedVideo.moduleType.slice(1)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Section</span>
                      <div className="text-lg font-semibold text-gray-900">
                        {getSectionIcon(selectedVideo.section)} {selectedVideo.section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Duration</span>
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.floor(selectedVideo.duration / 60)}:{(selectedVideo.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Upload Date</span>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(selectedVideo.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Video</h3>
              <p className="text-gray-600">Choose a video from the list to view details and manage settings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Videos</p>
              <p className="text-2xl font-semibold text-gray-900">{videos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Videos</p>
              <p className="text-2xl font-semibold text-gray-900">{videos.filter(v => v.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Modules</p>
              <p className="text-2xl font-semibold text-gray-900">{new Set(videos.map(v => v.moduleType)).size}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Duration</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.floor(videos.reduce((acc, v) => acc + v.duration, 0) / 60)}m
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Video Modal */}
      {showAddModal && (
        <AddVideoModal
          modules={availableModules}
          onClose={() => setShowAddModal(false)}
          onVideoAdded={(newVideo) => {
            setVideos([...videos, newVideo]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

// Add Video Modal Component
interface AddVideoModalProps {
  modules: any[];
  onClose: () => void;
  onVideoAdded: (video: Video) => void;
}

const AddVideoModal: React.FC<AddVideoModalProps> = ({ modules, onClose, onVideoAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    duration: 0,
    section: 'introduction' as const,
    moduleId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const selectedModule = modules.find(m => m._id === formData.moduleId);
      
      if (!selectedModule) {
        alert('Please select a module');
        return;
      }
      
      const videoData = {
        moduleId: formData.moduleId,
        video: {
          title: formData.title,
          description: formData.description,
          url: formData.url,
          thumbnail: formData.thumbnail || `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500`,
          duration: formData.duration,
          section: formData.section
        }
      };
      
      const response = await fetch('http://localhost:5000/api/admin/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Video added successfully:', result);
        
        const newVideo: Video = {
          id: result.data.video.id,
          title: result.data.video.title,
          description: result.data.video.description,
          url: result.data.video.url,
          thumbnail: result.data.video.thumbnail,
          duration: result.data.video.duration,
          section: result.data.video.section,
          moduleType: selectedModule.type,
          isActive: true,
          uploadDate: new Date().toISOString().split('T')[0]
        };
        
        onVideoAdded(newVideo);
      } else {
        const errorData = await response.json();
        alert(`Failed to add video: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error adding video:', error);
      alert('Network error occurred while adding video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Add New Video</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select
                value={formData.moduleId}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Module</option>
                {modules.map(module => (
                  <option key={module._id} value={module._id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="introduction">Introduction</option>
                <option value="preventionMeasures">Prevention Measures</option>
                <option value="duringDisaster">During Disaster</option>
                <option value="afterDisaster">After Disaster</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="Enter video title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              required
              placeholder="Enter video description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="https://example.com/video.mp4"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL (Optional)</label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                min="1"
                placeholder="180"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoManagement;
