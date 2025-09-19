import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../App.css";
import "./Header.css";
import logo from "../img/fpt-health-high-resolution-logo-transparent.png";
import logoWhite from "../img/fpt-health-high-resolution-logo-transparent-white.png";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login-lite";
import $ from "jquery";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const [isLoginVisible, setLoginVisible] = useState(false);
  const [name, setName] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isRegisterVisible, setRegisterVisible] = useState(false);
  const [isResetPassVisible, setResetPassVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [username, setUsername] = useState("");
  const [patientId, setPatientId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [alertMess, setAlertMess] = useState("");
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const { pathname } = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  const navigateToAppointment = () => {
    navigate("/appointment");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const toggleMenuVisibility = () => {
    setIsOpenMenu(!isOpenMenu);
    if (!isOpenMenu) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  };

  const toggleLoginVisibility = () => {
    setLoginVisible(!isLoginVisible);
    if (!isLoginVisible) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    setEmail("");
    setPassword("");
    setName("");
    setRepeatPassword("");
    setErrors({});
  };

  const toggleResetPassVisibility = () => {
    setResetPassVisible(!isResetPassVisible);
    setEmail("");
    setPassword("");
    setName("");
    setRepeatPassword("");
    setResetCode("");
    setErrors({});
  };

  useEffect(() => {
    const handleScroll = () => {
      const headerElement = document.getElementById("header");
      const headerHeight = headerElement.offsetHeight;

      if (window.scrollY > headerHeight) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  $(document).ready(function () {
    $(".social-btn").unbind("click");
    $(".social-btn.gg").on("click", function () {
      $(".gg-btn div").click();
    });
    $(".social-btn.fb").on("click", function () {
      $(".fb-btn #fb-login").click();
    });
  });

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    const storedPatientId = sessionStorage.getItem("patient_id");
    console.log("Stored Username:", storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
      setPatientId(storedPatientId);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const noErrors = Object.values(errors).every((error) => error === "");
    const allFieldsFilled = email && password && (isRegisterVisible ? name && repeatPassword : true);
    setIsFormValid(noErrors && allFieldsFilled);
  }, [errors, email, password, name, repeatPassword, isRegisterVisible]);

  const generateRandomCode = () => {
    const length = 6;
    const charset = "0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      code += charset[randomIndex];
    }
    return code;
  };

  const toggleRegisterVisibility = () => {
    setEmail("");
    setPassword("");
    setName("");
    setRepeatPassword("");
    setErrors({});
    setRegisterVisible(!isRegisterVisible);
  };

  const validateEmail = (value) => {
    const englishCharRegex = /^[a-zA-Z0-9@._-]*$/;

    if (!value.match(englishCharRegex)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Email can only contain English letters, numbers, and special characters like @._-",
      }));
    } else if (!value) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "Email is required" }));
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "Email is invalid" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    }
  };

  const validatePassword = (value) => {
    if (!value) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password is required" }));
    } else if (value.length < 8) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password must be at least 8 characters" }));
    } else if (!/[A-Z]/.test(value)) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password must contain at least one uppercase letter" }));
    } else if (!/[a-z]/.test(value)) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password must contain at least one lowercase letter" }));
    } else if (!/[0-9]/.test(value)) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password must contain at least one number" }));
    } else if (!/[!@#$%^&*()_+]/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password must contain at least one special character",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
    }
  };

  const validatePhone = (value) => {
    const regex = /^[0-9]{10,15}$/; // Chỉ chấp nhận số, từ 10-15 chữ số
    return regex.test(value) ? "" : "Invalid phone number";
  };

  const validateRepeatPassword = (value) => {
    if (value !== password) {
      setErrors((prevErrors) => ({ ...prevErrors, repeatPassword: "Passwords do not match" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, repeatPassword: "" }));
    }
  };

  const validateName = (value) => {
    const englishCharRegex = /^[a-zA-Z\s]*$/;

    if (!value.match(englishCharRegex)) {
      setErrors((prevErrors) => ({ ...prevErrors, name: "Name can only contain English letters" }));
    } else if (value && value.length < 3) {
      setErrors((prevErrors) => ({ ...prevErrors, name: "Name must be at least 3 characters" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, name: "" }));
    }
  };

  const handleInputChange = (e, setter, validateFn) => {
    setter(e.target.value);
    validateFn(e.target.value);
  };

  const handleGetCode = async () => {
    const email = document.getElementById("email").value;
    const code = generateRandomCode();
    setIsLoading(true);

    try {
      await axios.put("http://localhost:8081/api/v1/forgotpass/forgot", {
        patient_email: email,
        patient_code: code,
      });
      setCooldown(60);
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
      setAlertMess("Code sent successfully!");
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    } catch (error) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "Email is invalid" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const code = document.getElementById("reset-code").value;
    const newPassword = document.getElementById("password").value;

    try {
      await axios.put("http://localhost:8081/api/v1/forgotpass/reset", {
        patient_email: email,
        patient_code: code,
        new_password: newPassword,
      });
      setErrors((prevErrors) => ({ ...prevErrors, resetCode: "" }));
      toggleResetPassVisibility();
      setAlertMess("Password reset successfully!");
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    } catch (error) {
      setErrors((prevErrors) => ({ ...prevErrors, resetCode: "Invalid code" }));
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await axios.post("http://localhost:8081/api/v1/patients/login", {
        patient_email: email,
        patient_password: password,
      });

      console.log("Login response:", response.data);

      setUsername(response.data.patient_username); // ✅ Sửa ở đây
      setPatientId(response.data.patient_id);

      toggleLoginVisibility();
      sessionStorage.setItem("username", response.data.patient_username); // ✅ Và ở đây
      sessionStorage.setItem("patient_id", response.data.patient_id);
      setIsLoggedIn(true);

      setAlertMess("Sign in successfully");
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    } catch (error) {
      console.error("Error logging in:", error);
      setAlertMess("Email or password incorrect, please try again!");
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    }
  };

  const handleSuccessFacebook = async (response) => {
    try {
      const fbToken = response.authResponse.accessToken;
      const fbUserId = response.authResponse.userID;

      // Get user details from Facebook API
      const userDetailsResponse = await axios.get(`https://graph.facebook.com/me?fields=name,email&access_token=${fbToken}`);

      const { name, email } = userDetailsResponse.data;

      const serverResponse = await axios.post("http://localhost:8081/api/v1/patients/facebook-login", {
        accessToken: fbToken,
        userID: fbUserId,
        name: name,
        email: email,
      });

      const { username, patient_id } = serverResponse.data;
      if (username && patient_id) {
        setIsLoggedIn(true);
        setPatientId(patient_id);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("patient_id", patient_id);
        setUsername(username);
        toggleLoginVisibility();
        setAlertMess("Sign in successfully!");
        setTimeout(() => {
          setAlertMess("");
        }, 2000);
      } else {
        setAlertMess("Sign in failed!");
        setTimeout(() => {
          setAlertMess("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error during Facebook login", error);
      setAlertMess("Sign in failed!");
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    }
  };

  const handleFailureGoogle = () => {
    console.error("Google Login Failed");
    setAlertMess("Sign in failed!");
    setTimeout(() => {
      setAlertMess("");
    }, 2000);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value; // Lấy giá trị số điện thoại

    try {
      const response = await axios.post("http://localhost:8081/api/v1/patients/register", {
        patient_name: name,
        patient_email: email,
        patient_password: password,
        patient_username: email,
        patient_phone: phone, // Gửi kèm số điện thoại
      });
      toggleRegisterVisibility();
      setAlertMess("Sign up successfully!");
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    } catch (error) {
      console.error("Error during registration:", error);
      setAlertMess("Sign up failed!");
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    }
  };

  const handleFailureFacebook = () => {
    console.error("Facebook Login Failed");
    setAlertMess("Sign in failed!");
    setTimeout(() => {
      setAlertMess("");
    }, 2000);
  };

// Sửa hàm handleLogout
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

// Thêm hàm xác nhận logout
  const confirmLogout = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("patient_id");
    window.location.href = "/";
    sessionStorage.setItem("sign-out", "Sign out successfully!");
    setUsername("");
    setPatientId(null);
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    const signOutMessage = sessionStorage.getItem("sign-out");

    if (signOutMessage) {
      setAlertMess(signOutMessage);
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    }
    sessionStorage.removeItem("sign-out");
  }, []);

  useEffect(() => {
    const signOutMessage = sessionStorage.getItem("appointmentMessage");

    if (signOutMessage) {
      setAlertMess(signOutMessage);
      setTimeout(() => {
        setAlertMess("");
      }, 2000);
    }
    sessionStorage.removeItem("appointmentMessage");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (cooldown > 0) {
        setCooldown(cooldown - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  console.log("Render - isLoggedIn:", isLoggedIn, "username:", username);
const handleSuccessGoogle = async (credentialResponse) => {
  try {
    // Extract token from Google response
    const { credential } = credentialResponse;
    const decoded = jwtDecode(credential);

    console.log("Google login data:", {
      email: decoded.email,
      name: decoded.name,
    });

    // Send request to backend with matching key names
    const response = await axios.post("http://localhost:8081/api/v1/patients/google-login", {
      patient_email: decoded.email,
      patient_name: decoded.name,
      patient_password: "Password123!",
    });

    console.log("Backend response:", response.data);

    // Extract patient_name and patient_id from response
    const { patient_username, patient_id } = response.data;

    // Handle successful login
    if (patient_username) {
      setIsLoggedIn(true);
      setUsername(patient_username);
      sessionStorage.setItem("username", patient_username);

      // Handle patient_id (null for new accounts or valid ID for existing accounts)
      if (patient_id) {
        setPatientId(patient_id);
        sessionStorage.setItem("patient_id", patient_id);
      } else {
        setPatientId(null);
        sessionStorage.removeItem("patient_id"); // Ensure no stale patient_id
      }

      toggleLoginVisibility();
      setAlertMess("Sign in successfully!");
      setTimeout(() => setAlertMess(""), 2000);
    } else {
      throw new Error("No patient_username returned from backend");
    }
  } catch (error) {
    console.error("Error during Google login:", error);
    setAlertMess("Sign in failed!");
    setTimeout(() => setAlertMess(""), 2000);
  }
};

  return (
    <header id="header" className={`${isFixed ? "fixed" : ""}`}>
      {alertMess && (
        <div className="main-mess">
          <div className="message-text">{alertMess}</div>
          <div className="timeout-bar"></div>
        </div>
      )}
      <div className="logo">
        <NavLink to="/">
          <img src={`${isFixed ? logo : logoWhite}`} alt="fpt-health" style={{ width: 140 + "px", height: 40 + "px" }} />
        </NavLink>
      </div>
      <ul className="links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>
            News
          </NavLink>
        </li>
        <li>
          <NavLink to="/health-tips" className={({ isActive }) => (isActive ? "active" : "")}>
            Health Tips
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
            Contact
          </NavLink>
        </li>
      </ul>
      <ul className="header-btn">
        {isLoggedIn ? (
          <>
            <li>
              <NavLink to="/diagnosis" className="diagnosis-btn">
                Diagnostic
              </NavLink>
            </li>
            <li>
              <div className="profile-btn">
                <div className="user-name">{username}</div>
                <div className="profile-action">
                  <NavLink to="/appointment" className="book-btn">
                    Booking
                  </NavLink>
                  <NavLink to="/dashboard" className="dashboard">
                    Setting
                  </NavLink>
                  <a className="sign-out-btn" onClick={handleLogout}>
                    Sign out
                  </a>
                </div>
              </div>
            </li>
          </>
        ) : (
          <>
            <li>
              <button className="sign-in-btn" onClick={toggleLoginVisibility}>
                Sign in
              </button>
            </li>
            <li>
              <NavLink to="/appointment" className="booking-btn">
                Book Now
              </NavLink>
            </li>
          </>
        )}
      </ul>
      {isLoginVisible && (
        <div className="login-container">
          <div className="login-overlay"></div>
          <div className={`login-form ${isRegisterVisible || isResetPassVisible ? "hide" : "show"}`}>
            <a
              className="close-btn"
              onClick={() => {
                toggleLoginVisibility();
                setErrors({});
              }}
            >
              <img width="24" height="24" src="https://img.icons8.com/material-outlined/50/000000/delete-sign.png" alt="delete-sign" />
            </a>
            <h4 className="login-header">Sign in to FPT Health</h4>
            <div className="social-login">
              <div className="social-btn gg">
                <span>Google</span>
                <a>
                  <img width="25" height="25" src="https://img.icons8.com/fluency/48/google-logo.png" alt="google-logo" />
                </a>
              </div>
              <div className="gg-btn">
                <GoogleOAuthProvider clientId="1055399748338-10q97di87q0q9o5vqctm6obt55khqk6q.apps.googleusercontent.com">
                  <GoogleLogin onSuccess={handleSuccessGoogle} onError={handleFailureGoogle} />
                </GoogleOAuthProvider>
              </div>
              <div className="social-btn fb">
                <span>Facebook</span>
                <a>
                  <img width="25" height="25" src="https://img.icons8.com/fluency/48/facebook-new.png" alt="facebook-new" />
                </a>
              </div>
              <div className="fb-btn">
                <FacebookLogin appId="358159890313550" onSuccess={handleSuccessFacebook} onFailure={handleFailureFacebook} />
              </div>
            </div>
            <p className="or">OR</p>
            <form className="login-form-container" onSubmit={handleLogin}>
              <div className="input-list">
                <div className={`input-area ${email ? "has-value" : ""}`}>
                  <input className={`${errors.email ? "error" : ""}`} type="text" id="email" value={email} onChange={(e) => handleInputChange(e, setEmail, validateEmail)} />
                  <label htmlFor="email">Email Address</label>
                  {errors.email && <span className="error-mess">{errors.email}</span>}
                </div>
                <div className={`input-area ${password ? "has-value" : ""}`}>
                  <input className={`${errors.password ? "error" : ""}`} type="password" id="password" value={password} onChange={(e) => handleInputChange(e, setPassword, validatePassword)} />
                  <label htmlFor="password">Password</label>
                  {errors.password && <span className="error-mess">{errors.password}</span>}
                </div>
                <a className="forgot-pass" onClick={toggleResetPassVisibility}>
                  Forgot your password?
                </a>
                <button type="submit" disabled={!isFormValid}>
                  Sign in
                </button>
                <p className="form-content">
                  Don't have an account?{" "}
                  <a className="sign-up" onClick={toggleRegisterVisibility}>
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          </div>
          <div className={`register-form ${isRegisterVisible ? "show" : "hide"}`}>
            <a
              className="close-btn"
              onClick={() => {
                toggleLoginVisibility();
                setErrors({});
                toggleRegisterVisibility();
              }}
            >
              <img width="24" height="24" src="https://img.icons8.com/material-outlined/50/000000/delete-sign.png" alt="delete-sign" />
            </a>
            <h4 className="register-header">Create Account</h4>
            <form className="register-form-container" onSubmit={handleRegister}>
              <div className="input-list">
                <div className={`input-area ${name ? "has-value" : ""}`}>
                  <input className={`${errors.name ? "error" : ""}`} type="text" id="name" value={name} onChange={(e) => handleInputChange(e, setName, validateName)} />
                  <label htmlFor="email">Full Name</label>
                  {errors.name && <span className="error-mess">{errors.name}</span>}
                </div>
                <div className={`input-area ${email ? "has-value" : ""}`}>
                  <input className={`${errors.email ? "error" : ""}`} type="text" id="email" value={email} onChange={(e) => handleInputChange(e, setEmail, validateEmail)} />
                  <label htmlFor="email">Email Address</label>
                  {errors.email && <span className="error-mess">{errors.email}</span>}
                </div>
                <div className={`input-area ${phone ? "has-value" : ""}`}>
                  <input className={`${errors.phone ? "error" : ""}`} type="text" id="phone" value={phone} onChange={(e) => handleInputChange(e, setPhone, validatePhone)} />
                  <label htmlFor="phone">Phone Number</label>
                  {errors.phone && <span className="error-mess">{errors.phone}</span>}
                </div>
                <div className={`input-area ${password ? "has-value" : ""}`}>
                  <input className={`${errors.password ? "error" : ""}`} type="password" id="password" value={password} onChange={(e) => handleInputChange(e, setPassword, validatePassword)} />
                  <label htmlFor="password">Password</label>
                  {errors.password && <span className="error-mess">{errors.password}</span>}
                </div>
                <div className={`input-area ${repeatPassword ? "has-value" : ""}`}>
                  <input className={`${errors.repeatPassword ? "error" : ""}`} type="password" id="repeat-password" value={repeatPassword} onChange={(e) => handleInputChange(e, setRepeatPassword, validateRepeatPassword)} />
                  <label htmlFor="repeat-password">Confirm Password</label>
                  {errors.repeatPassword && <span className="error-mess">{errors.repeatPassword}</span>}
                </div>
                <div className="accept-btn">
                  <input type="checkbox" className="acceptChk" required />
                  <span>
                    I have read and agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                  </span>
                </div>
                <button type="submit" disabled={!isFormValid}>
                  Sign up
                </button>
                <p className="form-content">
                  Already have an account?{" "}
                  <a className="sign-in" onClick={toggleRegisterVisibility}>
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          </div>
          <div className={`reset-pass-form ${isResetPassVisible ? "show" : "hide"}`}>
            <a
              className="close-btn"
              onClick={() => {
                toggleResetPassVisibility();
              }}
            >
              <img width="24" height="24" src="https://img.icons8.com/material-outlined/50/000000/delete-sign.png" alt="delete-sign" />
            </a>
            <h4 className="reset-pass-header">Reset Password</h4>
            <form className="reset-pass-form-container" onSubmit={handlePasswordReset}>
              <div className="input-list">
                <div className={`input-area ${email ? "has-value" : ""}`}>
                  <input className={`${errors.email ? "error" : ""}`} type="text" id="email" value={email} onChange={(e) => handleInputChange(e, setEmail, validateEmail)} />
                  <button type="button" className="get-code" onClick={handleGetCode} disabled={cooldown > 0 || isLoading || !email || errors.email}>
                    {isLoading ? <div className="spinner"></div> : cooldown > 0 ? `Sent (${cooldown})` : "Send"}
                  </button>
                  <label htmlFor="email">Email Address</label>
                  {errors.email && <span className="error-mess">{errors.email}</span>}
                </div>
                <div className={`input-area ${resetCode ? "has-value" : ""}`}>
                  <input
                    className={`${errors.resetCode ? "error" : ""}`}
                    type="number"
                    id="reset-code"
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value);
                      if (errors.resetCode) {
                        setErrors({ ...errors, resetCode: "" });
                      }
                    }}
                  />
                  <label htmlFor="email">Code</label>
                  {errors.resetCode && <span className="error-mess">{errors.resetCode}</span>}
                </div>
                <div className={`input-area ${password ? "has-value" : ""}`}>
                  <input className={`${errors.password ? "error" : ""}`} type="password" id="password" value={password} onChange={(e) => handleInputChange(e, setPassword, validatePassword)} />
                  <label htmlFor="password">New Password</label>
                  {errors.password && <span className="error-mess">{errors.password}</span>}
                </div>
                <div className={`input-area ${repeatPassword ? "has-value" : ""}`}>
                  <input className={`${errors.repeatPassword ? "error" : ""}`} type="password" id="repeat-password" value={repeatPassword} onChange={(e) => handleInputChange(e, setRepeatPassword, validateRepeatPassword)} />
                  <label htmlFor="repeat-password">Confirm New Password</label>
                  {errors.repeatPassword && <span className="error-mess">{errors.repeatPassword}</span>}
                </div>
                <button type="submit" disabled={!isFormValid}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="toggle-btn" onClick={toggleMenuVisibility}>
        <div className={isOpenMenu ? "line line-1 open" : "line line-1"}></div>
        <div className={isOpenMenu ? "line line-2 open" : "line line-2"}></div>
        <div className={isOpenMenu ? "line line-3 open" : "line line-3"}></div>
      </div>
      {isOpenMenu && (
        <div className="menu-container">
          <ul className="menu-links">
            <li>
              <NavLink to="/" onClick={toggleMenuVisibility}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={toggleMenuVisibility}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/news" onClick={toggleMenuVisibility}>
                News
              </NavLink>
            </li>
            <li>
              <NavLink to="/health-tips" onClick={toggleMenuVisibility}>
                Health Tips
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={toggleMenuVisibility}>
                Contact
              </NavLink>
            </li>
            {isLoggedIn ? (
              <>
                <li>
                  <NavLink to="/dashboard" className="dashboard" onClick={toggleMenuVisibility}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <button
                    className="menu-book-btn"
                    onClick={() => {
                      toggleMenuVisibility();
                      navigateToAppointment();
                    }}
                  >
                    Book Now
                  </button>
                </li>
                <li>
                  <button
                    className="menu-sign-out"
                    onClick={() => {
                      handleLogout();
                      toggleMenuVisibility();
                    }}
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a
                    onClick={() => {
                      toggleLoginVisibility();
                      toggleMenuVisibility();
                    }}
                  >
                    Sign in
                  </a>
                </li>
                <li>
                  <button
                    className="menu-book-btn"
                    onClick={() => {
                      toggleMenuVisibility();
                      navigateToAppointment();
                    }}
                  >
                    Book Now
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
      {showLogoutConfirm && (
          <div className="login-container">
            <div className="login-overlay"></div>
            <div className="login-form show" style={{height: 'fit-content', padding: '20px'}}>
              <h4 className="login-header">Confirm Sign Out</h4>
              <p style={{textAlign: 'center', margin: '20px 0', color: '#000'}}>
                Are you sure you want to sign out?
              </p>
              <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                <button
                    onClick={confirmLogout}
                    style={{
                      backgroundColor: '#b90000',
                      color: 'white',
                      border: '1px solid #b90000',
                      padding: '10px 20px',
                      borderRadius: '25px',
                      cursor: 'pointer'
                    }}
                >
                  Yes
                </button>
                <button
                    onClick={cancelLogout}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#004b91',
                      border: '1px solid #004b91',
                      padding: '10px 20px',
                      borderRadius: '25px',
                      cursor: 'pointer'
                    }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
      )}
    </header>
  );
}

export default Header;
