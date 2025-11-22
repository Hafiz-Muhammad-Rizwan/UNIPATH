import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Share2, Send, Trash2 } from 'lucide-react';
import { getUniversityLogo } from '../utils/helpers';

function Post({ post, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now - postDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return postDate.toLocaleDateString();
  };

  const isLiked = post.likes?.some(like => 
    (typeof like === 'object' ? like._id : like) === user.id
  );

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/posts/${post._id}/like`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(`/api/posts/${post._id}/comment`, { content: commentText });
      setCommentText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleRepost = async () => {
    try {
      await axios.post(`/api/posts/${post._id}/repost`);
      const shareToChat = window.confirm('Share this post to a chat?');
      if (shareToChat) {
        navigate('/dashboard');
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`/api/posts/${post._id}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden text-sm md:text-base">
              {post.author?.profilePicture ? (
                <img
                  src={post.author.profilePicture}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                post.author?.name?.charAt(0).toUpperCase()
              )}
            </div>
            {post.author?.university && (
              <img
                src={getUniversityLogo(post.author.university)}
                alt={post.author.university}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white object-contain bg-white"
              />
            )}
          </div>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => navigate(`/profile/${post.author?._id || post.author}`)}
                      className="text-left hover:underline w-full"
                    >
                      <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{post.author?.name}</p>
                    </button>
                    <p className="text-xs md:text-sm text-gray-500 truncate">{post.author?.university} • {formatTime(post.createdAt)}</p>
                  </div>
        </div>
        {(post.author?._id === user.id || post.author === user.id) && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Post Actions */}
      <div className="flex items-center gap-6 pt-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <MessageCircle size={20} />
          <span>{post.comments?.length || 0}</span>
        </button>

        <button
          onClick={handleRepost}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors"
        >
          <Share2 size={20} />
          <span>{post.reposts?.length || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4">
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                    {comment.user?.profilePicture ? (
                      <img
                        src={comment.user.profilePicture}
                        alt={comment.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      comment.user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{comment.user?.name}</p>
                    <p className="text-gray-600 text-sm">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(comment.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;

