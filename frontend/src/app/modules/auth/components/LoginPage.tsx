import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../AuthContext';
import logo from '../../../../_movie/assets/images/img.png';
import {Link} from "react-router-dom";

const LoginPage: React.FC = () => {
    const { login } = useAuth();

    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [loginMethod, setLoginMethod] = useState<'username' | 'phone'>('username');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.password) {
            setError('Please fill in both fields.');
            return;
        }

        setIsLoading(true);
        try {
            await login(formData.username, formData.password);
            // PublicRoute handles redirect based on auth state
        } catch (err: any) {
            setError(
                err.response?.data?.detail || 'Login failed. Please check your details and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

        return (
        <div className="login-container d-flex vh-100">
            <div className="login-content mx-auto">
                <div className="text-center mb-4">
                    <img src={logo} alt="MovieBook Logo" className="form-logo" />
                </div>
                <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                        className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Log In
                    </div>
                    <div className="tab-divider"></div>
                    <div
                        className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                    </div>
                </div>

                <p className="mb-4 text-center auth-hint">
                    You can use your phone number or username
                </p>

                {/* Toggle Switch */}
                <div className="toggle-container d-flex mb-4">
                    <button
                        type="button"
                        className={`toggle-btn ${loginMethod === 'username' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('username')}
                    >
                        Username
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('phone')}
                    >
                        Phone Number
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-light small fw-medium">
                            {loginMethod === 'username' ? 'Username' : 'Phone Number'}
                        </label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text px-3">
                                <i className="bi bi-person"></i>
                            </span>
                            <input
                                type={loginMethod === 'phone' ? 'tel' : 'text'}
                                name="username"
                                className="form-control"
                                placeholder={`Enter your ${loginMethod}`}
                                value={formData.username}
                                onChange={handleInputChange}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-3">
                        <label className="form-label text-light small fw-medium">Password</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text px-3">
                                <i className="bi bi-lock"></i>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                autoComplete="current-password"
                            />
                            <span
                                className="input-group-text px-3"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </span>
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="text-end mb-4">
                        <Link to={'#'} className="forgot-link">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Error Box */}
                    {error && (
                        <div className="error-box d-flex align-items-center mb-4">
                            <i className="bi bi-exclamation-circle me-2"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Continue Button */}
                    <button
                        type="submit"
                        className="btn btn-continue w-100 rounded-pill py-3 fw-bold"
                        disabled={isLoading}
                        aria-busy={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <i className="bi bi-arrow-right arrow-icon" aria-hidden="true"></i>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;