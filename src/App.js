import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import StorePage from './pages/StorePage';
import SalePage from './pages/SalePage';
import MyPage from './pages/MyPage';
import SignUpPage from './pages/SignUpPage';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import BrandPage from './pages/BrandPage';
import PurchasePage from './pages/PurchasePage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/*" element={<DefaultLayout />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

function DefaultLayout() {
    const gradientStyle = {
        background: 'linear-gradient(to bottom, #6b6b6b 0px, #ffffff 200px, #ffffff 100%)',
        minHeight: '100vh',
        padding: '20px'
    };

    return (
        <div style={gradientStyle}>
            <NavBar />
            <Routes>
                <Route path="/store" element={<StorePage />} />
                <Route path="/my" element={<MyPage />} />
                <Route path="/sale" element={<SalePage />} />
                <Route path="/store/:id" element={<ProductDetail />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/brand/:brand" element={<BrandPage />} />
                <Route path="/purchase/:id" element={<PurchasePage />} />
            </Routes>
        </div>
    );
}

export default App;
