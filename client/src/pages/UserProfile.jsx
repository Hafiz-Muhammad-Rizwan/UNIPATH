import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getUniversityLogo } from '../utils/helpers';
import Post from '../components/Post';
import Navigation from '../components/Navigation';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/profile/${userId}`);
      setProfileUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/api/posts/user/${userId}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pb-20 md:pb-0">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 md:py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Profile</h1>
        </div>
      </header>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-semibold overflow-hidden">
                {profileUser.profilePicture ? (
                  <img
                    src={profileUser.profilePicture}
                    alt={profileUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileUser.name?.charAt(0).toUpperCase()
                )}
              </div>
              {profileUser.university && (
                <img
                  src={getUniversityLogo(profileUser.university)}
                  alt={profileUser.university}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white object-contain bg-white"
                />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{profileUser.name}</h1>
              <p className="text-gray-600">{profileUser.university}</p>
              {profileUser.major && (
                <p className="text-sm text-gray-500">{profileUser.major} • {profileUser.year}</p>
              )}
              {profileUser.bio && (
                <p className="mt-2 text-gray-700">{profileUser.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post key={post._id} post={post} onUpdate={fetchUserPosts} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

