import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, GraduationCap, Users, MessageCircle, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Normalize email to lowercase and trim whitespace
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedPassword = password.trim();
      
      const response = await axios.post('/api/auth/login', { 
        email: normalizedEmail, 
        password: normalizedPassword 
      });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      let errorMessage = 'Login failed';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors[0]?.msg || 'Validation error';
      } else if (err.message === 'Network Error' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the server is running.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap size={48} strokeWidth={2} />
              <h1 className="text-4xl font-bold">STARK Connect</h1>
            </div>
            <p className="text-primary-100 text-lg">
              Pakistan's Premier University Social Network
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Connect with Peers</h3>
                <p className="text-primary-100">
                  Find and connect with students from universities across Pakistan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Real-Time Chat</h3>
                <p className="text-primary-100">
                  Instant messaging with read receipts and typing indicators
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Share & Engage</h3>
                <p className="text-primary-100">
                  Post updates, share ideas, and engage with your university community
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-primary-100">
              Join thousands of students already connected on STARK
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex md:hidden items-center gap-2 text-primary-600 mb-6">
              <GraduationCap size={32} strokeWidth={2.5} />
              <span className="text-2xl font-bold">STARK Connect</span>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">Welcome Back!</h2>
            <p className="text-secondary-600">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2 animate-slide-down">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Input
              type="email"
              label="University Email"
              placeholder="student@university.edu.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              required
            />

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              leftIcon={<LogIn size={20} />}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-secondary-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

