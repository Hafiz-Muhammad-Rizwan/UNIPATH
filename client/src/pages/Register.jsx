import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import UniversitySelector from '../components/UniversitySelector';
import { universities, getUniversityById } from '../data/universities';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    universityId: '',
    year: 'Other',
    major: '',
    bio: '',
    interests: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUniversitySelect = (university) => {
    setFormData({
      ...formData,
      university: university.name,
      universityId: university.id,
      email: formData.email || `student@${university.domain}`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if admin email - make university optional
    const normalizedEmail = formData.email.toLowerCase().trim();
    const isAdminEmail = normalizedEmail === 'enastark545@gmail.com';
    
    if (!isAdminEmail && !formData.university) {
      setError('University is required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        university: formData.university || 'Admin',
        year: formData.year,
        major: formData.major,
        bio: formData.bio,
        interests: formData.interests
      });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Join PakUni Connect</h1>
          <p className="text-sm md:text-base text-gray-600">Connect with students from universities across Pakistan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
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
                University Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
                placeholder="student@university.edu.pk"
              />
            </div>

            <div className="md:col-span-2">
              <UniversitySelector
                selectedUniversity={formData.universityId || formData.university}
                onSelect={handleUniversitySelect}
                showSearch={true}
              />
              {formData.email.toLowerCase().trim() === 'enastark545@gmail.com' && (
                <p className="text-xs text-primary-600 mt-1">
                  Admin email detected - University selection is optional
                </p>
              )}
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
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-400 to-primary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-200"
          >
            <UserPlus size={20} />
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

