import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginAdmin.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import bannerVideo from '../img/banner-video.mp4';
import logo from '../img/fpt-health-high-resolution-logo-transparent-white.png'; // logo tùy bạn

const LoginAdmin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setValidationError('');

        if (!username || !password) {
            setValidationError('Please enter both username and password.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/api/v1/staffs/login', { username, password });
            if (response.status === 200 && response.data.staff_type === 'admin') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('role', 'admin');
                localStorage.setItem('adminId', response.data.admin_id);
                navigate('/admindashboard');
            } else {
                setError('You do not have access.');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setError('Username or password incorrect');
            } else if (error.response?.status === 403) {
                setError('You do not have access.');
            } else {
                setError('An error occurred, please try again later.');
            }
        }
    };

    return (
        <div className="admin-login-container">
            <video autoPlay muted loop className="background-video">
                <source src={bannerVideo} type="video/mp4" />
            </video>

            <div className="admin-login-box">
                <div className="login-header">
                    <img src={logo} alt="Logo" className="logo" />
                    <h2>Admin Login</h2>
                    <p>Access the management dashboard</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                            <span className="eye-icon" onClick={togglePassword}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    {validationError && <div className="error">{validationError}</div>}
                    {error && <div className="error">{error}</div>}
                    <button className="submit-btn" type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;
