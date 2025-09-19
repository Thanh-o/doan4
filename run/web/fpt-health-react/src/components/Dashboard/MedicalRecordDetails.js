import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "./MedicalRecordDetails.css";

function MedicalRecordDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (location.state && location.state.record) {
      setSelectedRecord(location.state.record);
    } else {
      navigate("/dashboard");
    }
  }, [location, navigate]);

  if (!selectedRecord) {
    return null;
  }



  const handleDownloadPDF = async () => {
    try {
      const backBtn = document.querySelector('.back-btn');
      const footer = document.querySelector('.record-footer');
      const element = document.querySelector('.medical-record-container');

      if (backBtn) backBtn.style.display = '';
      if (footer) footer.style.display = '';

      if (!element) {
        alert('Content not found to download as PDF');
        return;
      }

      // Đợi ảnh load hết
      const images = element.querySelectorAll("img");
      await Promise.all(
          Array.from(images).map((img) => {
            if (!img.complete) {
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            }
            return Promise.resolve();
          })
      );

      // Chụp canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Tự động scale vừa khít cả chiều rộng và cao
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      // Chỉ in đúng 1 trang duy nhất
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      const fileName = `MedicalRecord_${selectedRecord.patient_name.replace(/\s+/g, '_')}_${selectedRecord.record_id || 'Unknown'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      const backBtn = document.querySelector('.back-btn');
      const footer = document.querySelector('.record-footer');
      if (backBtn) backBtn.style.display = 'flex';
      if (footer) footer.style.display = 'block';
    }
  };




  return (
      <div className="medical-record-details-page">
        <div className="medical-record-container">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>

          <div className="record-header">
            <h1>MEDICAL RECORD</h1>

            <div className="record-meta">
            <span>
              Record ID: 583{selectedRecord.record_id || ""}
            </span>
              <span>
              Follow-up date:{" "}
                {selectedRecord.follow_up_date
                    ? new Date(selectedRecord.follow_up_date).toLocaleDateString("en-GB")
                    : ""}
            </span>
            </div>
          </div>

          <div className="record-content">
            {/* Patient Information */}
            <div className="record-section">
              <div className="section-title">Patient Information</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Full name:</span>
                  <span className="value">{selectedRecord.patient_name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">
                  {selectedRecord.patient_email || ""}
                </span>
                </div>
                <div className="info-item">
                  <span className="label">Date of Birth:</span>
                  <span className="value">
                  {selectedRecord.patient_dob
                      ? new Date(selectedRecord.patient_dob).toLocaleDateString("en-GB")
                      : ""}
                </span>
                </div>
                <div className="info-item">
                  <span className="label">Gender:</span>
                  <span className="value">
                  {selectedRecord.patient_gender || ""}
                </span>
                </div>
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">
                  {selectedRecord.patient_address || ""}
                </span>
                </div>
                <div className="info-item">
                  <span className="label">Phone number:</span>
                  <span className="value">
                  {selectedRecord.patient_phone || ""}
                </span>
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div className="record-section">
              <div className="section-title">Doctor Information</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Doctor:</span>
                  <span className="value">
                  {selectedRecord.doctors?.[0]?.doctor_name || ""}
                </span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">
                  {selectedRecord.doctors?.[0]?.doctor_email || ""}
                </span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">
                  {selectedRecord.doctors?.[0]?.doctor_phone || ""}
                </span>
                </div>
                <div className="info-item">
                  <span className="label">Specialty:</span>
                  <span className="value">
                  {selectedRecord.doctors?.[0]?.summary || ""}
                </span>
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="record-section">
              <div className="section-title">Examination Information</div>

              <div className="detail-item">
                <span className="label">Symptoms:</span>
                <span className="value">
                {selectedRecord.symptoms || ""}
              </span>
              </div>

              <div className="detail-item">
                <span className="label">Diagnosis:</span>
                <div
                    className="value diagnosis-html-content"
                    dangerouslySetInnerHTML={{
                      __html: selectedRecord.diagnosis || ""
                    }}
                />
              </div>

              <div className="detail-item">
                <span className="label">Treatment:</span>
                <span className="value">
                {selectedRecord.treatment || ""}
              </span>
              </div>

              <div className="detail-item">
                <span className="label">Prescription:</span>
                <span className="value">
                {selectedRecord.prescription || ""}
              </span>
              </div>
            </div>

            {selectedRecord.image && (
                <div className="record-section">
                  <div className="section-title">Attached Image</div>
                  <div className="image-container">
                    <img
                        src={selectedRecord.image}
                        alt="Medical record image"
                        className="record-image"
                        onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/300x200?text=No+image")
                        }

                    />
                  </div>
                </div>
            )}
          </div>

          <div className="record-footer">
            <button
                className="action-button"
                onClick={handleDownloadPDF}
                aria-label="Download PDF"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
  );
}

export default MedicalRecordDetails;
