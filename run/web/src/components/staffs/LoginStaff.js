import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../admins/LoginAdmin.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import bannerVideo from '../img/banner-video.mp4';
import logo from '../img/fpt-health-high-resolution-logo-transparent-white.png'; // logo tùy bạn

const LoginAdmin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra lần cuối trước khi gửi (có thể bỏ nếu bạn chỉ cần validate ở ô input)
        if (!username.trim()) {
            setUsernameError('Please enter your username.');
            return;
        }
        if (!password.trim()) {
            setPasswordError('Please enter your password.');

            return;
        }
        try {
            const response = await axios.post('http://localhost:8081/api/v1/staffs/loginStaff', { username, password });
            if (response.status === 200 && response.data.staff_type === 'staff') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('role', 'staff');
                localStorage.setItem('staffId', response.data.staff_id);
                console.log('Logged in staffId:', response.data.staff_id); // Kiểm tra giá trị của staffId
                navigate('/staffdashboard');
            } else {
                setError('You do not have access');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Username or password incorrect');
            } else if (error.response && error.response.status === 403) {
                setError('You do not have access');
            } else {
                setError('An error occurred, please try again later');
            }
        }
    };

    const handleUsernameBlur = () => {
        if (!username.trim()) {
            setUsernameError('Please enter your username.');

        } else {
            setUsernameError('');
        }
    };

    const handlePasswordBlur = () => {
        if (!password.trim()) {
            setPasswordError('Please enter your password.');

        } else {
            setPasswordError('');
        }
    };
    return (
        <div className="admin-login-container">
            <video autoPlay muted loop className="background-video">
                <source src={bannerVideo} type="video/mp4"/>
            </video>

            <div className="admin-login-box">
                <div className="login-header">
                    <img src={logo} alt="Logo" className="logo"/>
                    <h2>Doctor Login</h2>
                    <p>Access the management dashboard</p>
                </div>
                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={handleUsernameBlur}
                            placeholder="Enter your username"
                        />
                        {usernameError && <div className="error">{usernameError}</div>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={handlePasswordBlur}
                                placeholder="Enter your password"
                            />
                            <span className="eye-icon" onClick={togglePassword}>
                                {showPassword ? <FaEyeSlash/> : <FaEye/>}
                            </span>
                        </div>
                        {passwordError && <div className="error">{passwordError}</div>}
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button className="submit-btn" type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;
