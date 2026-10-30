import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import { Blog } from './pages/Blog';
import { AllBlogs } from './pages/AllBlogs';
import { NotFound } from './pages/NotFound';
import { BlogPost } from './components/BlogPost';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthExpiryHandler } from './components/AuthExpiryHandler';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthExpiryHandler />
            <ErrorBoundary>
              <Routes>
                {/* Public Feed & Discovery */}
                <Route path="/" element={<Navigate to="/blogs" replace />} />
                <Route path="/blogs" element={<AllBlogs />} />
                <Route path="/blog/:id" element={<Blog />} />

                {/* Authentication */}
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Authoring Flows */}
                <Route
                  path="/blog"
                  element={
                    <ProtectedRoute>
                      <BlogPost />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blog/edit/:id"
                  element={
                    <ProtectedRoute>
                      <BlogPost />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
