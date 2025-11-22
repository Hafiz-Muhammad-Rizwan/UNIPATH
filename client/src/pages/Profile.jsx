import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, Camera } from 'lucide-react';
import Navigation from '../components/Navigation';
import Post from '../components/Post';

function Profile() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    year: 'Other',
    major: '',
    bio: '',
    interests: [],
    profilePicture: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        year: user.year || 'Other',
        major: user.major || '',
        bio: user.bio || '',
        interests: user.interests || [],
        profilePicture: user.profilePicture || ''
      });
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`/api/posts/user/${user.id}`);
      setUserPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64 for simple storage (in production, use cloud storage)
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        const response = await axios.put('/api/users/profile', {
          ...formData,
          profilePicture: base64Image
        });
        setFormData({ ...formData, profilePicture: base64Image });
        await fetchUser();
        setMessage('Profile picture updated!');
      } catch (error) {
        setMessage('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.put('/api/users/profile', formData);
      await fetchUser();
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <div className="text-gray-700 text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pb-20 md:pb-0">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 md:py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Edit Profile</h1>
        </div>
      </header>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">

          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded ${
                message.includes('success')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-semibold overflow-hidden">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary-400 text-white p-2 rounded-full cursor-pointer hover:bg-primary-500 transition-colors shadow-md">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <p className="font-medium text-gray-800">Profile Picture</p>
                <p className="text-sm text-gray-500">Click camera icon to upload</p>
                {uploading && <p className="text-xs text-primary-600">Uploading...</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <input
                type="text"
                value={user?.university || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">University cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major/Field
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                maxLength={500}
                className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
                placeholder="Tell others about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-200"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* User Posts */}
        <div className="mt-6 md:mt-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Your Posts ({userPosts.length})</h2>
          <div>
            {userPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">No posts yet. Go to Feed to create your first post!</p>
                <button
                  onClick={() => navigate('/feed')}
                  className="mt-4 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors shadow-md"
                >
                  Go to Feed
                </button>
              </div>
            ) : (
              userPosts.map((post) => (
                <Post key={post._id} post={post} onUpdate={fetchUserPosts} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

