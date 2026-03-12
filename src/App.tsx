import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Portfolio from "./pages/Portfolio";
import Experience from "./pages/Experience";
import { BlogList, BlogPost } from "./pages/Blog";
import Contact from "./pages/Contact";
import BackOffice from "./pages/BackOffice";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPortal from "./pages/UserPortal";
import Consultations from "./pages/Consultations";
import BookConsultation from "./pages/BookConsultation";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/experience" element={<Experience />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/consultations" element={<Consultations />} />
      <Route
        path="/consultations/book/:productId"
        element={
          <ProtectedRoute>
            <BookConsultation />
          </ProtectedRoute>
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <UserPortal />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/back-office-manage" element={<BackOffice />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Application error:", error, errorInfo);
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
