// src/components/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import bannerVideo from './img/banner-video.mp4';
import logo from './img/fpt-health-high-resolution-logo-transparent-white.png';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="homepage-container">
            <video autoPlay muted loop className="background-video">
                <source src={bannerVideo} type="video/mp4" />
            </video>

            <div className="homepage-box">
                <img src={logo} alt="Logo" className="logo" />
                <h2 className="h2-homepage">Welcome to FPT Health</h2>
                <p className="p-homepage">Please select a role to continue</p>
                <div className="role-buttons">
                    <button className="click-login" onClick={() => navigate('/adminlogin')}>I am Administrator</button>
                    <button className="click-login" onClick={() => navigate('/doctorlogin')}>I am a Doctor</button>

                </div>
            </div>
        </div>
    );
};

export default HomePage;
