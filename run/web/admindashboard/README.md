.medical-record-details-page {
min-height: 100vh;
background-color: #f8f9fa;
padding: 20px;
margin-top: 80px;
}

.medical-record-container {
max-width: 1000px;
margin: 0 auto;
background: #ffffff;
border-radius: 8px;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
padding: 30px;
font-family: 'Arial', sans-serif;
}



.back-btn {
display: inline-flex;
align-items: center;
gap: 8px;
background: #e9ecef;
border: none;
color: #495057;
font-size: 14px;
cursor: pointer;
margin-bottom: 20px;
padding: 8px 12px;
border-radius: 4px;
text-decoration: none;
}

.back-btn:hover {
background: #dee2e6;
}

.record-header {
text-align: center;
margin-bottom: 30px;
padding-bottom: 20px;
border-bottom: 2px solid #e9ecef;
}

.record-header h1 {
margin: 0 0 10px 0;
font-size: 24px;
color: #343a40;
font-weight: 600;
}

.patient-name {
font-size: 20px;
color: #6c757d;
margin-bottom: 10px;
}

.record-meta {
display: flex;
justify-content: center;
gap: 20px;
font-size: 14px;
color: #6c757d;
}

.record-content {
margin-top: 20px;
}

.record-section {
margin-bottom: 25px;
padding: 20px;
background: #f8f9fa;
border-radius: 6px;
border-left: 4px solid #007bff;
}

.section-title {
background-color: #f8f9fa;

border-bottom: 1px solid #dee2e6;

align-items: center;

font-size: 18px;
font-weight: 600;
color: #495057;
margin:0 0 20px 0  ;
}

.info-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 15px;
}

.info-item {
display: flex;
flex-direction: column;
gap: 5px;
}

.label {
font-weight: 500;
color: #6c757d;
font-size: 14px;
}

.value {
font-size: 16px;
color: #343a40;
word-break: break-word;
}

.detail-item {
margin-bottom: 15px;
}

.detail-item .label {
display: block;
margin-bottom: 5px;
}

.detail-item .value {
display: block;
padding: 10px;
background: #ffffff;
border: 1px solid #dee2e6;
border-radius: 4px;
}

.prescription-section {
margin-top: 20px;
}

.prescription-title {
font-size: 16px;
font-weight: 600;
color: #343a40;
margin-bottom: 10px;
}

.prescription-table {
width: 100%;
border-collapse: collapse;
background: #ffffff;
border: 1px solid #dee2e6;
border-radius: 4px;
overflow: hidden;
}

.prescription-table th {
background: #007bff;
color: #ffffff;
padding: 12px;
text-align: left;
font-weight: 500;
font-size: 14px;
}

.prescription-table td {
padding: 12px;
border-top: 1px solid #dee2e6;
font-size: 14px;
color: #343a40;
}

.prescription-table tr:nth-child(even) td {
background: #f8f9fa;
}

.image-container {
margin: 20px 0;
text-align: center;
}

.record-image {
max-width: 100%;
max-height: 300px;
border: 1px solid #dee2e6;
border-radius: 4px;
}

.record-footer {
text-align: center;
margin-top: 30px;
padding-top: 20px;
border-top: 1px solid #dee2e6;
}

.action-button {
display: inline-block;
padding: 10px 20px;
background: #007bff;
color: #ffffff;
border: none;
border-radius: 4px;
cursor: pointer;
font-size: 14px;
text-decoration: none;
margin: 0 5px;
transition: background-color 0.2s ease;
}

.action-button:hover {
background: #0056b3;
color: #ffffff;
}

/* Responsive design */
@media (max-width: 768px) {
.medical-record-details-page {
padding: 10px;
}

.medical-record-container {
padding: 20px;
}

.record-meta {
flex-direction: column;
gap: 10px;
}

.info-grid {
grid-template-columns: 1fr;
}
}
.diagnosis-html-content {
line-height: 1.6;
}

.diagnosis-html-content h3,
.diagnosis-html-content h4 {
margin: 8px 0 4px 0;
font-weight: bold;
color: #333;
}

.diagnosis-html-content h3 {
font-size: 16px;
}

.diagnosis-html-content h4 {
font-size: 14px;
}

.diagnosis-html-content ul,
.diagnosis-html-content ol {
margin: 8px 0;
padding-left: 20px;
}

.diagnosis-html-content li {
margin: 4px 0;
}

.diagnosis-html-content p {
margin: 4px 0;
}

.diagnosis-html-content strong {
font-weight: bold;
}

.diagnosis-html-content em {
font-style: italic;
}

.diagnosis-html-content u {
text-decoration: underline;
}
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

const prescriptions = selectedRecord.prescription
? selectedRecord.prescription
.split(";")
.filter((drug) => drug.trim() !== "")
: [];

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


const dosages = ["1 pill", "2 pills", "1/2 pill"];
const quantities = ["10 pills", "20 pills", "15 pills"];
const instructions = [
"Take after meals",
"Take before sleeping",
"Take in the morning",
];

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

              {prescriptions.length > 0 && (
                  <div className="prescription-section">
                    <div className="prescription-title">Prescription</div>
                    <table className="prescription-table">
                      <thead>
                      <tr>
                        <th>No.</th>
                        <th>Drug name</th>
                        <th>Dosage</th>
                        <th>Quantity</th>
                        <th>Instructions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {prescriptions.map((drug, index) => {
                        const dosage = dosages[Math.floor(Math.random() * dosages.length)];
                        const quantity = quantities[Math.floor(Math.random() * quantities.length)];
                        const instruction = instructions[Math.floor(Math.random() * instructions.length)];

                        return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{drug.trim()}</td>
                              <td>{dosage}</td>
                              <td>{quantity}</td>
                              <td>{instruction}</td>
                            </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
              )}
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
                        // loading="lazy"
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
