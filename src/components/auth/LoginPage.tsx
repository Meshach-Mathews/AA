import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

const LoginPage: React.FC = () => {
  const { signIn, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      setError(error.message || 'Invalid email or password');
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Website Link */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Acadeemia Website
          </Link>
        </div>

        <div className="text-center">
          <img 
            src="https://cfdptmabmfdmaiphtcqa.supabase.co/storage/v1/object/sign/acadeemia-bolt/acadeemia-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NmM2NjMyZS0yMmZkLTRkMDAtYTI5ZS05MzVmNWFmOTBhNDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhY2FkZWVtaWEtYm9sdC9hY2FkZWVtaWEtbG9nby5wbmciLCJpYXQiOjE3NTA3NTAzMTUsImV4cCI6MzMyODY3NTAzMTV9.OIlwvdnuomUOtCYPQ4uIsvMRY12r3PdL9PEHVqKkxSk"
            alt="Acadeemia Logo" 
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your Acadeemia dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle size={20} className="text-red-600 mr-2 flex-shrink-0" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            className="py-3"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                Contact us for access
              </Link>
            </p>
          </div>
        </form>

        {/* Back to Website Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Explore Acadeemia
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Learn more about our school management solutions
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/features" 
                className="text-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Features</span>
              </Link>
              <Link 
                to="/demo" 
                className="text-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Request Demo</span>
              </Link>
              <Link 
                to="/pricing" 
                className="text-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Pricing</span>
              </Link>
              <Link 
                to="/contact" 
                className="text-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;