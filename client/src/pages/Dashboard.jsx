import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, MessageCircle, Users, Settings, Filter } from 'lucide-react';
import { universities, getUniversityByName } from '../data/universities';
import { getUniversityLogo } from '../utils/helpers';
import Navigation from '../components/Navigation';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('online'); // 'online', 'search', 'chats'
  const [selectedUniversityFilter, setSelectedUniversityFilter] = useState('');
  const [onlineCounts, setOnlineCounts] = useState({});
  const [universityCounts, setUniversityCounts] = useState({});

  // Sync activeTab with URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'search' || tab === 'chats') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOnlineUsers();
    fetchChatRooms();
    fetchOnlineCounts();
    fetchUniversityCounts();
    
    // Refresh online counts every 10 seconds
    const interval = setInterval(() => {
      fetchOnlineCounts();
      fetchUniversityCounts();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineCounts = async () => {
    try {
      const response = await axios.get('/api/users/online-counts');
      setOnlineCounts(response.data);
    } catch (error) {
      console.error('Error fetching online counts:', error);
    }
  };

  const fetchUniversityCounts = async () => {
    try {
      const response = await axios.get('/api/users/university-counts');
      setUniversityCounts(response.data);
    } catch (error) {
      console.error('Error fetching university counts:', error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get('/api/users/online');
      setOnlineUsers(response.data);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get('/api/chat/rooms');
      setChatRooms(response.data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const handleSearch = async () => {
    const searchTerm = selectedUniversityFilter || searchQuery;
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Try to find matching university from the list
      const matchingUni = universities.find(u => 
        u.shortName.toLowerCase() === searchTerm.toLowerCase().trim() ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        searchTerm.toLowerCase().trim().includes(u.shortName.toLowerCase())
      );
      
      // Try multiple search strategies
      let response;
      let searchParam = searchTerm.trim();
      
      // Strategy 1: Try with the search term as-is
      response = await axios.get('/api/users/search', {
        params: { university: searchParam }
      });
      
      // Strategy 2: If no results and we found a matching uni, try with full name
      if (response.data.length === 0 && matchingUni) {
        response = await axios.get('/api/users/search', {
          params: { university: matchingUni.name }
        });
      }
      
      // Strategy 3: If still no results, try with short name
      if (response.data.length === 0 && matchingUni) {
        response = await axios.get('/api/users/search', {
          params: { university: matchingUni.shortName }
        });
      }
      
      // Strategy 4: Try lowercase version
      if (response.data.length === 0) {
        response = await axios.get('/api/users/search', {
          params: { university: searchParam.toLowerCase() }
        });
      }
      
      // Strategy 5: Try uppercase version
      if (response.data.length === 0) {
        response = await axios.get('/api/users/search', {
          params: { university: searchParam.toUpperCase() }
        });
      }
      
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityClick = (universityId) => {
    const uni = universities.find(u => u.id === universityId);
    if (uni) {
      // Navigate to university users page
      navigate(`/university/${encodeURIComponent(uni.name)}`);
    }
  };

  const handleUniversityFilter = async (universityId) => {
    setSelectedUniversityFilter(universityId);
    const uni = universities.find(u => u.id === universityId);
    if (uni) {
      setSearchQuery(uni.shortName);
      setLoading(true);
      try {
        let response;
        
        // Try multiple strategies to find users
        // Strategy 1: Try with short name
        response = await axios.get('/api/users/search', {
          params: { university: uni.shortName }
        });
        
        // Strategy 2: If no results, try with full name
        if (response.data.length === 0) {
          response = await axios.get('/api/users/search', {
            params: { university: uni.name }
          });
        }
        
        // Strategy 3: Try lowercase short name
        if (response.data.length === 0) {
          response = await axios.get('/api/users/search', {
            params: { university: uni.shortName.toLowerCase() }
          });
        }
        
        // Strategy 4: Try lowercase full name
        if (response.data.length === 0) {
          response = await axios.get('/api/users/search', {
            params: { university: uni.name.toLowerCase() }
          });
        }
        
        // Strategy 5: Try extracting acronym from full name (e.g., "UMT" from "University of Management and Technology (UMT)")
        if (response.data.length === 0 && uni.name.includes('(')) {
          const acronymMatch = uni.name.match(/\(([^)]+)\)/);
          if (acronymMatch) {
            response = await axios.get('/api/users/search', {
              params: { university: acronymMatch[1] }
            });
          }
        }
        
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }
  };


  const startChat = async (otherUserId) => {
    try {
      const response = await axios.post('/api/chat/room', {
        otherUserId
      });
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    }
  };

  const getOtherParticipant = (room) => {
    return room.participants.find(p => p._id !== user.id);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'search' || tab === 'chats') {
      navigate(`/dashboard?tab=${tab}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">PakUni Connect</h1>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Welcome, {user?.name}!</p>
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => handleTabChange('online')}
              className={`px-4 md:px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'online'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <Users size={18} className="inline mr-2" />
              <span className="hidden sm:inline">Online </span>({onlineUsers.length})
            </button>
            <button
              onClick={() => handleTabChange('search')}
              className={`px-4 md:px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'search'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <Search size={18} className="inline mr-2" />
              Search
            </button>
            <button
              onClick={() => handleTabChange('chats')}
              className={`px-4 md:px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'chats'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <MessageCircle size={18} className="inline mr-2" />
              <span className="hidden sm:inline">My Chats </span>({chatRooms.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {activeTab === 'online' && (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Online Students</h2>
                <div className="space-y-2">
                  {onlineUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No online users</p>
                  ) : (
                    onlineUsers.map((onlineUser) => (
                      <div
                        key={onlineUser._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => navigate(`/profile/${onlineUser._id}`)}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {onlineUser.profilePicture ? (
                                <img
                                  src={onlineUser.profilePicture}
                                  alt={onlineUser.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                onlineUser.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <img
                              src={getUniversityLogo(onlineUser.university)}
                              alt={onlineUser.university}
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white object-contain bg-white"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 hover:text-primary-600 flex items-center gap-2">
                              {onlineUser.name}
                              <span className="text-xs text-green-600 font-normal">● Online</span>
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <img
                                src={getUniversityLogo(onlineUser.university)}
                                alt={onlineUser.university}
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              {onlineUser.university}
                            </p>
                            {onlineUser.major && (
                              <p className="text-xs text-gray-500">{onlineUser.major}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${onlineUser._id}`);
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                            title="View Profile"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startChat(onlineUser._id);
                            }}
                            className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors flex items-center gap-2"
                          >
                            <MessageCircle size={16} />
                            Chat
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Search Students</h2>
                
                {/* University Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter size={16} className="inline mr-1" />
                    Filter by University
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {universities.filter(u => u.id !== 'other').map((uni) => {
                      const universityData = universityCounts[uni.name] || universityCounts[uni.shortName] || { total: 0, online: 0 };
                      const totalCount = universityData.total || 0;
                      const onlineCount = universityData.online || 0;
                      return (
                        <button
                          key={uni.id}
                          onClick={() => handleUniversityClick(uni.id)}
                          className={`p-3 border-2 rounded-lg transition-all hover:scale-105 relative ${
                            selectedUniversityFilter === uni.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                          }`}
                          title={`${totalCount} ${totalCount === 1 ? 'student' : 'students'} from ${uni.name} (${onlineCount} online)`}
                        >
                          <img
                            src={uni.logo}
                            alt={uni.shortName}
                            className="w-12 h-12 mx-auto object-contain mb-2 rounded"
                          />
                          <p className="text-xs font-medium text-gray-700 text-center">{uni.shortName}</p>
                          {totalCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                              {totalCount}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Or search by university name..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors flex items-center gap-2"
                  >
                    <Search size={18} />
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                <div className="space-y-2">
                  {searchResults.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      {searchQuery ? 'No results found' : 'Enter a search query to find students'}
                    </p>
                  ) : (
                    searchResults.map((result) => (
                      <div
                        key={result._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => navigate(`/profile/${result._id}`)}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {result.profilePicture ? (
                                <img
                                  src={result.profilePicture}
                                  alt={result.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                result.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <img
                              src={getUniversityLogo(result.university)}
                              alt={result.university}
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white object-contain bg-white"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 hover:text-primary-600">{result.name}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <img
                                src={getUniversityLogo(result.university)}
                                alt={result.university}
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              {result.university}
                            </p>
                            {result.major && (
                              <p className="text-xs text-gray-500">{result.major} • {result.year}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${result._id}`);
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                            title="View Profile"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startChat(result._id);
                            }}
                            className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors flex items-center gap-2"
                          >
                            <MessageCircle size={16} />
                            Chat
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'chats' && (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Your Chats</h2>
                <div className="space-y-2">
                  {chatRooms.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No chat rooms yet. Start a conversation!</p>
                  ) : (
                    chatRooms.map((room) => {
                      const otherUser = getOtherParticipant(room);
                      const lastMessage = room.messages[room.messages.length - 1];
                      return (
                        <div
                          key={room._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => navigate(`/profile/${otherUser?._id}`)}
                          >
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {otherUser?.profilePicture ? (
                                <img
                                  src={otherUser.profilePicture}
                                  alt={otherUser.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                otherUser?.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 hover:text-primary-600">{otherUser?.name}</p>
                              <p className="text-sm text-gray-600 truncate">
                                {lastMessage ? lastMessage.content : 'No messages yet'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {otherUser?.isOnline && (
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/chat/${room._id}`);
                              }}
                              className="px-3 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm"
                              title="Open Chat"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 h-fit hidden lg:block">
            <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">University</p>
                <p className="font-medium">{user?.university}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year</p>
                <p className="font-medium">{user?.year}</p>
              </div>
              {user?.major && (
                <div>
                  <p className="text-sm text-gray-600">Major</p>
                  <p className="font-medium">{user?.major}</p>
                </div>
              )}
              <button
                onClick={() => navigate('/profile')}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Settings size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

