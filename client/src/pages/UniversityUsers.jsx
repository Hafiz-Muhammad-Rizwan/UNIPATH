import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MessageCircle, Users, Wifi, WifiOff } from 'lucide-react';
import { getUniversityLogo } from '../utils/helpers';
import Navigation from '../components/Navigation';

function UniversityUsers() {
  const { universityName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0 });

  useEffect(() => {
    fetchUsers();
  }, [universityName]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const decodedName = decodeURIComponent(universityName);
      const response = await axios.get(`/api/users/by-university/${decodedName}`);
      setUsers(response.data);
      
      const online = response.data.filter(u => u.isOnline).length;
      setStats({ total: response.data.length, online });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (userId) => {
    try {
      const response = await axios.post('/api/chat/room', { otherUserId: userId });
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const decodedUniversityName = decodeURIComponent(universityName || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{decodedUniversityName}</h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{stats.total} {stats.total === 1 ? 'student' : 'students'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Wifi size={16} />
                  <span>{stats.online} online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      {/* Users List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No students found from this university</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((universityUser) => (
              <div
                key={universityUser._id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {universityUser.profilePicture ? (
                        <img
                          src={universityUser.profilePicture}
                          alt={universityUser.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        universityUser.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {universityUser.university && (
                      <img
                        src={getUniversityLogo(universityUser.university)}
                        alt={universityUser.university}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white object-contain bg-white shadow-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        universityUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800 truncate">{universityUser.name}</p>
                      {universityUser.isOnline ? (
                        <Wifi size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <WifiOff size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{universityUser.university}</p>
                    {universityUser.major && (
                      <p className="text-xs text-gray-500 mb-2">{universityUser.major}</p>
                    )}
                    {universityUser.year && (
                      <p className="text-xs text-primary-600 font-medium mb-2">{universityUser.year}</p>
                    )}
                    <button
                      onClick={() => startChat(universityUser._id)}
                      className="w-full mt-2 px-3 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                    >
                      <MessageCircle size={16} />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UniversityUsers;

