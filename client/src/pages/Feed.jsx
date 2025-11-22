import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';
import Post from '../components/Post';
import Navigation from '../components/Navigation';

function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setLoading(true);
    setError('');
    try {
      // Check if server is reachable
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create a post');
        return;
      }

      const response = await axios.post('/api/posts', { content: newPost }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
      await fetchPosts(); // Refresh to get updated post with all fields
    } catch (err) {
      console.error('Error creating post:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      });
      
      let errorMessage = 'Failed to create post. ';
      
      if (err.response?.status === 404) {
        errorMessage += 'Server route not found. Please make sure the server is running on port 5000.';
      } else if (err.response?.status === 401) {
        errorMessage += 'You must be logged in. Please log in again.';
      } else if (err.response?.status === 503) {
        errorMessage = err.response?.data?.message || 'Database not connected. Please check MongoDB connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      // Auto-hide error after 8 seconds
      setTimeout(() => setError(''), 8000);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Feed</h1>
        </div>
      </header>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Create Post */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm md:text-base">
              {error}
            </div>
          )}
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              rows="4"
              maxLength={1000}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white resize-none text-sm md:text-base"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-500">{newPost.length}/1000</span>
              <button
                type="submit"
                disabled={!newPost.trim() || loading}
                className="px-4 md:px-6 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
              >
                <Send size={18} />
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div>
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post key={post._id} post={post} onUpdate={fetchPosts} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Feed;

