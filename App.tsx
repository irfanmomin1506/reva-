
import React, { useState, useEffect } from 'react';
import { DataProvider } from './services/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Operations } from './components/Operations';
import { StudentPortal } from './components/StudentPortal';
import { Consumables } from './components/Consumables';
import { Maintenance } from './components/Maintenance';
import { Audit } from './components/Audit';
import { Vendors } from './components/Vendors';
import { FacultyProfile } from './components/FacultyProfile';
import { VeoLab } from './components/VeoLab';
import { KeyRound, Mail, AlertCircle, School, Chrome } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { supabase } from './services/supabase';

const Login: React.FC<{ onLogin: () => void, onStudentPortal: () => void }> = ({ onLogin, onStudentPortal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        // If Supabase fails, try Firebase as a fallback (if you have users there)
        console.warn('Supabase login failed, attempting Firebase fallback...');
        try {
          await signInWithEmailAndPassword(auth, email, password);
          onLogin();
          return;
        } catch (firebaseErr) {
          throw supabaseError; // Throw original Supabase error if fallback also fails
        }
      }

      console.log('Supabase Login successful:', data);
      onLogin();
    } catch (err: any) {
      console.error('Login Error Detail:', err);
      if (err.message === 'Failed to fetch') {
        setError('Network Error: Could not connect to the authentication server. Please check your internet or verify your Supabase API keys.');
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      alert("Signup successful! Please check your email for verification.");
      setIsSignUp(false);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
        {/* Background Decorative Elements for Reva Theme */}
        <div className="absolute top-0 left-0 w-full h-64 bg-reva-navy transform -skew-y-6 origin-top-left -mt-20 z-0"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-reva-orange opacity-20 rounded-full blur-3xl z-0"></div>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10 border-t-4 border-reva-orange">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-reva-navy">REVA <span className="text-reva-orange">IMS</span></h1>
            <p className="text-gray-500 mt-2">{isSignUp ? 'Create Faculty Account' : 'Faculty Login Portal'}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
              <AlertCircle size={16} className="mr-2" /> {error}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reva-navy focus:border-transparent outline-none transition-all"
                  placeholder="faculty@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reva-navy focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-reva-orange hover:underline">Forgot Password?</a>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-reva-navy text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Secure Login')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-reva-navy hover:text-reva-orange font-medium"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <Chrome size={20} className="mr-2 text-blue-600" />
              Sign in with Google
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <button onClick={onStudentPortal} className="text-sm text-gray-600 hover:text-reva-orange flex items-center justify-center w-full group">
                <School size={16} className="mr-2 group-hover:scale-110 transition-transform" />
                Access Student Request Portal
             </button>
          </div>
        </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Firebase auth state
    const unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setIsAuthReady(true);
      }
    });

    // Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
      } else if (!auth.currentUser) {
        setIsAuthenticated(false);
      }
      setIsAuthReady(true);
    });

    return () => {
      unsubscribeFirebase();
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-reva-orange"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (isStudentMode) {
      return <StudentPortal onBack={() => setIsStudentMode(false)} />;
    }

    if (!isAuthenticated) {
      return (
        <Login 
          onLogin={() => setIsAuthenticated(true)} 
          onStudentPortal={() => setIsStudentMode(true)} 
        />
      );
    }

    return (
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
      >
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'inventory' && <Inventory />}
        {(activeTab === 'issue-return' || activeTab === 'students') && <Operations activeTab={activeTab} />}
        {activeTab === 'consumables' && <Consumables />}
        {activeTab === 'maintenance' && <Maintenance />}
        {activeTab === 'ai-lab' && <VeoLab />}
        {activeTab === 'audit' && <Audit />}
        {activeTab === 'vendors' && <Vendors />}
        {activeTab === 'profile' && <FacultyProfile />}
      </Layout>
    );
  };

  return (
    <DataProvider>
      {renderContent()}
    </DataProvider>
  );
};

export default MainApp;
