import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ProductListingPage from './pages/ProductListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import SupplierRegistration from './pages/SupplierRegistration'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { AuthProvider } from "./context/AuthContext";
import Profile from './pages/Profile'
  import { Toaster } from "react-hot-toast"
import Messages  from './pages/Messages'
  import { useLocation } from 'react-router-dom'
function App() {

    const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        
        
        {!isAdminRoute && <Navbar />}

        <main className="flex-grow">
          <Toaster position="top-right" />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categorySlug" element={<ProductListingPage />} />
            <Route path="/product/:productSlug" element={<ProductDetailPage />} />
            <Route path="/become-supplier" element={<SupplierRegistration />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {!isAdminRoute && <Footer />}
      </div>
    </AuthProvider>
  );
}


export default App
