import React, { useEffect, useState } from "react";
import "./Diagnosis.css";
import bannerImg from "../img/pexels-pavel-danilyuk-8442097.jpg";
import logo from "../img/fpt-health-high-resolution-logo-transparent-white.png";
import axios from "axios";
import rightImg from "../img/macroscopic_right-P2IJVT7N.digested.svg";
import wrongImg from "../img/macroscopic_wrong-GNJLHPWX.digested.svg";

function Diagnosis() {
  const [imagePreviews, setImagePreviews] = useState([]); // Image previews
  const [selectedFiles, setSelectedFiles] = useState([]); // Selected files
  const [symptoms, setSymptoms] = useState(""); // User-entered symptoms
  const [predictionResult, setPredictionResult] = useState(null); // Prediction result
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(""); // Error message
  const [openInfo, setOpenInfo] = useState(true); // Info modal
  const [medicalHistory, setMedicalHistory] = useState([]); // Medical history
  const [comparisonMessage, setComparisonMessage] = useState(""); // Comparison message
  const patientId = sessionStorage.getItem("patient_id"); // Get patient_id from sessionStorage

  // Check patient_id on component mount
  useEffect(() => {
    if (!patientId) {
      alert("Please log in to access this feature.");
      window.location.href = "/";
    } else {
      loadMedicalHistory();
    }
  }, [patientId]);

  // Load medical history
  const loadMedicalHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/v1/medicalrecords/search`,
        {
          params: { patient_id: patientId },
        }
      );
      setMedicalHistory(response.data);
    } catch (error) {
      console.error("Error loading medical history:", error);
      setErrorMessage("Failed to load medical history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Find previous diagnosis with the same condition
  const findPreviousDiagnosis = (conclusion) => {
    const previousDiagnosis = medicalHistory.filter(
      (record) => record.diagnosis === conclusion
    );
    return previousDiagnosis.length > 0
      ? previousDiagnosis[previousDiagnosis.length - 1]
      : null;
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMessage("Please select at least one image.");
      return;
    }
    if (!symptoms.trim()) {
      setErrorMessage("Please enter symptoms.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("symptoms", symptoms);

    setLoading(true);
    setErrorMessage("");
    setPredictionResult(null);
    setComparisonMessage("");

    try {
      // Upload images to Spring Boot
      const imageUploadResponse = await axios.post(
        "http://localhost:8081/api/v1/medicalrecords/images/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const uploadedImagePaths = imageUploadResponse.data.paths;

      // Send prediction request to AI API
      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Extract data from AI response
      const { conclusion, severity, advice_and_prescription } = aiResponse.data;
      const { advice, prescription } = advice_and_prescription;

      // Round severity
      const roundedSeverity = parseFloat(severity).toFixed(2);

      // Compare with previous diagnosis
      const previousDiagnosis = findPreviousDiagnosis(conclusion);
      if (previousDiagnosis) {
        const previousSeverity = parseFloat(previousDiagnosis.severity);
        setComparisonMessage(
          roundedSeverity > previousSeverity
            ? "The current condition is more severe than the previous visit."
            : "The current condition is less severe than the previous visit."
        );
      } else {
        // setComparisonMessage("This is the first visit for this condition.");
      }

      // Store prediction result
      setPredictionResult({
        conclusion,
        advice,
        prescription,
        severity: roundedSeverity,
      });

      // Get current date
      const today = new Date().toISOString().split("T")[0];

      // Create medical record data
      const medicalRecordData = {
        patient_id: patientId,
        diagnosis: conclusion,
        treatment: advice,
        prescription,
        follow_up_date: today,
        severity: roundedSeverity,
        image_paths: uploadedImagePaths,
      };

      // Save medical record to database
      await axios.post(
        "http://localhost:8081/api/v1/medicalrecords/insert",
        medicalRecordData
      );
    } catch (error) {
      console.error("Error in prediction or saving medical record:", error);
      //   setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Manage no-scroll class for info modal
  useEffect(() => {
    document.body.classList.toggle("no-scroll", openInfo);
  }, [openInfo]);

  return (
    <main className="diagnosis-container">
      {openInfo && (
        <div className="diagnosis-notice">
          <div className="notice-overlay"></div>
          <div className="notice-content">
            <div className="notice-content-left">
              <h4>How to take a photo</h4>
              <div className="tutorial-content">
                <div className="tutorial-item">
                  <img className="tutorial-img" src={wrongImg} alt="wrong" />
                  <span>
                    <img
                      width="40"
                      height="40"
                      src="https://img.icons8.com/ios-filled/200/b90000/circled-x.png"
                      alt="circled-x"
                    />
                  </span>
                </div>
                <div className="tutorial-item">
                  <img className="tutorial-img" src={rightImg} alt="right" />
                  <span>
                    <img
                      width="40"
                      height="40"
                      src="https://img.icons8.com/ios-filled/200/2ecc71/checked--v1.png"
                      alt="checked--v1"
                    />
                  </span>
                </div>
              </div>
              <button onClick={() => setOpenInfo(false)}>I Understand!</button>
            </div>
            <div className="notice-content-right">
              <p>Take the photo about 4 inches away from the problem area.</p>
              <p>Center your symptom in the photo.</p>
              <p>Make sure there is good lighting.</p>
              <p>Ensure your photo isn't blurry.</p>
              <h5>
                Notes: The results provided are for reference purposes only and
                do not guarantee absolute accuracy. Therefore, users should
                exercise caution and verify information from other reliable
                sources before making decisions based on these results.
              </h5>
            </div>
          </div>
        </div>
      )}
      <section className="diagnosis-banner">
        <img
          className="diagnosis-banner-img"
          src={bannerImg}
          alt="dashboard-banner-img"
        />
        <h4>Disease Diagnosis</h4>
        <div className="diagnosis-overlay"></div>
      </section>
      <section className="diagnosis-content">
        <div className="diagnosis-content-left">
          <h4>
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/ios-filled/200/004b91/camera--v3.png"
              alt="camera--v3"
            />{" "}
            Upload your photo
          </h4>
          <p>
            Make sure the photo is taken about 4 inches away from the problem
            area and center your symptom in the frame.
          </p>
        </div>
        <div className="diagnosis-content-right">
          <div className="upload-photo">
            <button
              onClick={() => document.getElementById("img-input").click()}
            >
              <img
                width="20"
                height="20"
                src="https://img.icons8.com/puffy-filled/200/ffffff/upload.png"
                alt="upload"
              />{" "}
              Upload a photo
            </button>
            <input
              id="img-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              multiple
            />
            <div className="upload-box">
              {imagePreviews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Uploaded ${index}`}
                  className="upload-image"
                />
              ))}
            </div>
          </div>
          <div className="symptoms-input">
            <label htmlFor="symptoms">Describe your symptoms:</label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter your symptoms..."
              rows="4"
            />
          </div>
          <div className="diagnosis-action">
            <button
              className="change-photo-btn"
              onClick={() => document.getElementById("img-input").click()}
              disabled={imagePreviews.length === 0}
            >
              Change Photo
            </button>
            <button
              className="prediction-btn"
              onClick={handleSubmit}
              disabled={
                imagePreviews.length === 0 || !symptoms.trim() || loading
              }
            >
              Prediction
            </button>
          </div>
          {loading && <div className="loading-spinner">Loading...</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {predictionResult && (
            <div className="prediction">
              <p>
                <strong>Conclusion:</strong> {predictionResult.conclusion}
              </p>
              <p>
                <strong>Advice:</strong> {predictionResult.advice}
              </p>
              <p>
                <strong>Prescription:</strong> {predictionResult.prescription}
              </p>
              {/*<p>*/}
              {/*  <strong>Severity:</strong> {predictionResult.severity}*/}
              {/*</p>*/}
            </div>
          )}
          {comparisonMessage && (
            <div className="comparison-message">
              <p>{comparisonMessage}</p>
            </div>
          )}
        </div>
      </section>

      <footer>
        <div className="footer-container-top">
          <div className="footer-logo">
            <img
              src={logo}
              alt="fpt-health"
              style={{ width: "140px", height: "40px" }}
            />
          </div>
          <div className="footer-social">
            <div className="fb-icon">
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/ios-filled/50/FFFFFF/facebook--v1.png"
                alt="facebook--v1"
              />
            </div>
            <div className="zl-icon">
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/ios-filled/50/FFFFFF/zalo.png_IMAGEN_QUE_FALTA"
                alt="zalo"
              />
            </div>
            <div className="ms-icon">
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/ios-filled/50/FFFFFF/facebook-messenger.png"
                alt="facebook-messenger"
              />
            </div>
          </div>
        </div>
        <div className="footer-container-middle">
          <div className="footer-content">
            <h4>FPT Health</h4>
            <p>
              FPT Health Hospital is committed to providing you and your family
              with the highest quality medical services, featuring a team of
              professional doctors and state-of-the-art facilities. Your health
              is our responsibility.
            </p>
          </div>
          <div className="footer-hours-content">
            <h4>Opening Hours</h4>
            <div className="footer-hours">
              <div className="footer-content-item">
                <span>Monday - Friday:</span>
                <span>7:00 AM - 8:00 PM</span>
              </div>
              <div className="footer-content-item">
                <span>Saturday:</span> <span>7:00 AM - 6:00 PM</span>
              </div>
              <div className="footer-content-item">
                <span>Sunday:</span> <span>7:30 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
          <div className="footer-content">
            <h4>Contact</h4>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <div>
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/ios-filled/50/FFFFFF/marker.png"
                    alt="marker"
                  />
                </div>
                <p>
                  8 Ton That Thuyet, My Dinh Ward, Nam Tu Liem District, Ha Noi
                </p>
              </div>
              <div className="footer-contact-item">
                <div>
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/ios-filled/50/FFFFFF/phone.png"
                    alt="phone"
                  />
                </div>
                <p>+84 987 654 321</p>
              </div>
              <div className="footer-contact-item">
                <div>
                  <img
                    width="20"
                    height="20"
                    src="https://img.icons8.com/ios-filled/50/FFFFFF/new-post.png"
                    alt="new-post"
                  />
                </div>
                <p>fpthealth@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-container-bottom">
          <div>© 2024 FPT Health. All rights reserved.</div>
          <div>
            <a>Terms of use</a> | <a>Privacy Policy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Diagnosis;
