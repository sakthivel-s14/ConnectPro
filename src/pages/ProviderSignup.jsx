import React, { useState, useRef } from "react";
import {
  FiCheckCircle, FiUpload, FiFile, FiX, FiArrowRight,
  FiArrowLeft, FiUser, FiMail, FiLock, FiBriefcase,
  FiClock, FiAlertCircle, FiFileText,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ProviderSignup.css";
import { getStoredUsers, getStoredProviders } from "../utils/storage";

export default function ProviderSignup() {
  const navigate = useNavigate();

  // ── Step state (1=info, 2=documents, 3=success) ──────────────
  const [step, setStep] = useState(1);

  // ── Step 1: Account info ─────────────────────────────────────
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [skills,          setSkills]          = useState("");
  const [experience,      setExperience]      = useState("");
  const [bio,             setBio]             = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step1Error,      setStep1Error]      = useState("");

  // ── Step 2: Documents ────────────────────────────────────────
  const [resumeFile,      setResumeFile]      = useState(null);   // required
  const [certFile,        setCertFile]        = useState(null);   // optional
  const [linkedinProof,   setLinkedinProof]   = useState("");     // optional URL
  const [step2Error,      setStep2Error]      = useState("");
  const [uploading,       setUploading]       = useState(false);

  const resumeRef = useRef();
  const certRef   = useRef();

  // ── Read file as base64 data URL ─────────────────────────────
  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ── Step 1 validation ────────────────────────────────────────
  const validateStep1 = () => {
    if (!name.trim())    { setStep1Error("Please enter your full name.");     return false; }
    if (name.trim().length < 2) { setStep1Error("Name must be at least 2 characters."); return false; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!email.trim())   { setStep1Error("Please enter your email.");         return false; }
    if (!emailOk)        { setStep1Error("Please enter a valid email.");      return false; }
    if (!skills.trim())  { setStep1Error("Please enter your skills.");        return false; }
    if (skills.trim().length < 3) { setStep1Error("Skills must be at least 3 characters."); return false; }
    if (!experience.trim())       { setStep1Error("Please enter your experience."); return false; }
    if (!password)       { setStep1Error("Please create a password.");        return false; }
    if (password.length < 6)      { setStep1Error("Password must be at least 6 characters."); return false; }
    if (password !== confirmPassword) { setStep1Error("Passwords do not match."); return false; }

    // Email uniqueness check
    const existingUsers     = getStoredUsers();
    const existingProviders = getStoredProviders();
    const existingApps      = JSON.parse(localStorage.getItem("connectpro_provider_applications") || "[]");
    const emailLower        = email.toLowerCase().trim();

    if (
      existingUsers.some(u => u.email.toLowerCase() === emailLower) ||
      existingProviders.some(p => p.email.toLowerCase() === emailLower) ||
      existingApps.some(a => a.email.toLowerCase() === emailLower)
    ) {
      setStep1Error("This email is already registered. Please use a different one.");
      return false;
    }

    setStep1Error("");
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep(2);
  };

  // ── File picker helpers ───────────────────────────────────────
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setStep2Error("Resume must be a PDF file."); return; }
    if (file.size > 5 * 1024 * 1024)    { setStep2Error("Resume file must be under 5 MB."); return; }
    setResumeFile(file);
    setStep2Error("");
  };

  const handleCertChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setStep2Error("Certificate must be a PDF file."); return; }
    if (file.size > 5 * 1024 * 1024)    { setStep2Error("Certificate file must be under 5 MB."); return; }
    setCertFile(file);
    setStep2Error("");
  };

  // ── Drag-and-drop ────────────────────────────────────────────
  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (type === "resume") { resumeRef.current.files = e.dataTransfer.files; handleResumeChange({ target: { files: e.dataTransfer.files } }); }
    else                   { certRef.current.files   = e.dataTransfer.files; handleCertChange({ target: { files: e.dataTransfer.files } }); }
  };

  // ── Submit application ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!resumeFile) { setStep2Error("Please upload your resume (PDF) — it is required."); return; }
    setStep2Error("");
    setUploading(true);

    try {
      const resumeData = await readFileAsDataURL(resumeFile);
      const certData   = certFile ? await readFileAsDataURL(certFile) : null;

      const application = {
        id:             Date.now(),
        name:           name.trim(),
        email:          email.toLowerCase().trim(),
        skills:         skills.trim(),
        experience:     experience.trim(),
        bio:            bio.trim(),
        password,
        role:           "provider",
        status:         "pending",          // "pending" | "approved" | "rejected"
        submittedAt:    new Date().toISOString(),
        reviewedAt:     null,
        rejectionReason: "",
        documents: {
          resume: {
            name:     resumeFile.name,
            size:     resumeFile.size,
            dataUrl:  resumeData,
          },
          certificate: certData ? {
            name:    certFile.name,
            size:    certFile.size,
            dataUrl: certData,
          } : null,
          linkedinProof: linkedinProof.trim() || null,
        },
      };

      const existing = JSON.parse(localStorage.getItem("connectpro_provider_applications") || "[]");
      existing.push(application);
      localStorage.setItem("connectpro_provider_applications", JSON.stringify(existing));

      setStep(3);
    } catch (err) {
      setStep2Error("Failed to process files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Stepper indicator ─────────────────────────────────────────
  const Stepper = () => (
    <div className="pv-stepper">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`pv-step ${step >= s ? "pv-step-done" : ""} ${step === s ? "pv-step-active" : ""}`}>
            {step > s ? <FiCheckCircle size={14} /> : s}
          </div>
          {s < 3 && <div className={`pv-step-line ${step > s ? "pv-line-done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="provider-page">

      {/* ── LEFT PANEL ── */}
      <div className="provider-left">
        <div className="left-container">
          <div className="welcome-tag">Provider Verification</div>
          <h1>Become A<br />Verified Mentor</h1>
          <p>
            Share your expertise with thousands of learners.
            We verify every provider to ensure quality mentorship.
          </p>

          <div className="feature-list">
            <div className="feature-item"><FiCheckCircle size={20} /><p>Earn From Mentorship</p></div>
            <div className="feature-item"><FiCheckCircle size={20} /><p>Build Your Audience</p></div>
            <div className="feature-item"><FiCheckCircle size={20} /><p>Conduct Live Sessions</p></div>
            <div className="feature-item"><FiCheckCircle size={20} /><p>Verified Badge on Profile</p></div>
          </div>

          {/* Verification process steps */}
          <div className="pv-process">
            <p className="pv-process-title">Verification Process</p>
            <div className="pv-process-step">
              <div className="pv-process-dot active" />
              <div>
                <p className="pv-process-label">Submit Application</p>
                <p className="pv-process-desc">Fill your details &amp; upload documents</p>
              </div>
            </div>
            <div className="pv-process-step">
              <div className="pv-process-dot" />
              <div>
                <p className="pv-process-label">Admin Review</p>
                <p className="pv-process-desc">Our team reviews within 24–48 hrs</p>
              </div>
            </div>
            <div className="pv-process-step">
              <div className="pv-process-dot" />
              <div>
                <p className="pv-process-label">Start Mentoring</p>
                <p className="pv-process-desc">Get verified and launch your sessions</p>
              </div>
            </div>
          </div>

          <div className="tags">
            <span>Verified</span><span>Earn</span><span>Mentor</span><span>Growth</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="provider-right">
        <div className="provider-card pv-wide-card">

          {step < 3 && (
            <>
              <div className="provider-badge">
                {step === 1 ? "Step 1 of 2 — Account Info" : "Step 2 of 2 — Upload Documents"}
              </div>
              <h2>{step === 1 ? "Create Provider Account" : "Upload Proof Documents"}</h2>
              <p className="subtitle">
                {step === 1
                  ? "Fill your details to start the verification."
                  : "Upload your resume (required) so we can verify your credentials."}
              </p>
              <Stepper />
            </>
          )}

          {/* ══════════════ STEP 1: ACCOUNT INFO ══════════════ */}
          {step === 1 && (
            <>
              <div className="pv-form-grid">
                <div className="input-group">
                  <label><FiUser size={13} style={{ marginRight: 5 }} />Full Name</label>
                  <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label><FiMail size={13} style={{ marginRight: 5 }} />Email Address</label>
                  <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label><FiBriefcase size={13} style={{ marginRight: 5 }} />Skills / Expertise</label>
                  <input type="text" placeholder="e.g. React, Python, UI/UX" value={skills} onChange={e => setSkills(e.target.value)} />
                </div>
                <div className="input-group">
                  <label><FiClock size={13} style={{ marginRight: 5 }} />Experience</label>
                  <input type="text" placeholder="e.g. 5 Years in Software Dev" value={experience} onChange={e => setExperience(e.target.value)} />
                </div>
                <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Short Bio (optional)</label>
                  <textarea rows={2} placeholder="Tell learners about yourself..." value={bio} onChange={e => setBio(e.target.value)} style={{ resize: "vertical" }} />
                </div>
                <div className="input-group">
                  <label><FiLock size={13} style={{ marginRight: 5 }} />Password</label>
                  <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="input-group">
                  <label><FiLock size={13} style={{ marginRight: 5 }} />Confirm Password</label>
                  <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              {step1Error && (
                <div className="pv-error">
                  <FiAlertCircle size={14} /> {step1Error}
                </div>
              )}

              <button className="provider-btn pv-next-btn" onClick={handleNextStep}>
                Next: Upload Documents <FiArrowRight size={16} />
              </button>

              <p className="bottom-text">
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </>
          )}

          {/* ══════════════ STEP 2: DOCUMENTS ══════════════ */}
          {step === 2 && (
            <>
              {/* RESUME — Required */}
              <div className="pv-upload-section">
                <div className="pv-upload-label">
                  <FiFileText size={14} /> Resume / CV
                  <span className="pv-required-badge">Required</span>
                </div>
                <div
                  className={`pv-dropzone ${resumeFile ? "pv-dropzone-filled" : ""}`}
                  onClick={() => resumeRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, "resume")}
                >
                  <input
                    ref={resumeRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={handleResumeChange}
                  />
                  {resumeFile ? (
                    <div className="pv-file-preview">
                      <div className="pv-file-icon"><FiFile size={22} /></div>
                      <div className="pv-file-info">
                        <p className="pv-file-name">{resumeFile.name}</p>
                        <p className="pv-file-size">{formatSize(resumeFile.size)} · PDF</p>
                      </div>
                      <button
                        className="pv-file-remove"
                        onClick={e => { e.stopPropagation(); setResumeFile(null); resumeRef.current.value = ""; }}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="pv-dropzone-idle">
                      <div className="pv-upload-icon"><FiUpload size={24} /></div>
                      <p className="pv-drop-title">Click or drag &amp; drop your Resume</p>
                      <p className="pv-drop-hint">PDF only · Max 5 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CERTIFICATE — Optional */}
              <div className="pv-upload-section">
                <div className="pv-upload-label">
                  <FiFileText size={14} /> Certificate / Degree
                  <span className="pv-optional-badge">Optional</span>
                </div>
                <div
                  className={`pv-dropzone ${certFile ? "pv-dropzone-filled" : ""}`}
                  onClick={() => certRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, "cert")}
                >
                  <input
                    ref={certRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={handleCertChange}
                  />
                  {certFile ? (
                    <div className="pv-file-preview">
                      <div className="pv-file-icon"><FiFile size={22} /></div>
                      <div className="pv-file-info">
                        <p className="pv-file-name">{certFile.name}</p>
                        <p className="pv-file-size">{formatSize(certFile.size)} · PDF</p>
                      </div>
                      <button
                        className="pv-file-remove"
                        onClick={e => { e.stopPropagation(); setCertFile(null); certRef.current.value = ""; }}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="pv-dropzone-idle">
                      <div className="pv-upload-icon pv-upload-icon-opt"><FiUpload size={24} /></div>
                      <p className="pv-drop-title">Click or drag &amp; drop Certificate</p>
                      <p className="pv-drop-hint">PDF only · Max 5 MB · Optional</p>
                    </div>
                  )}
                </div>
              </div>

              {/* LINKEDIN — Optional */}
              <div className="input-group" style={{ marginTop: 4 }}>
                <label>LinkedIn Profile URL <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinProof}
                  onChange={e => setLinkedinProof(e.target.value)}
                />
              </div>

              {/* Info notice */}
              <div className="pv-info-box">
                <FiAlertCircle size={15} />
                <p>Your documents are stored securely and only reviewed by ConnectPro admins for verification purposes.</p>
              </div>

              {step2Error && (
                <div className="pv-error">
                  <FiAlertCircle size={14} /> {step2Error}
                </div>
              )}

              <div className="pv-btn-row">
                <button className="pv-back-btn" onClick={() => setStep(1)}>
                  <FiArrowLeft size={15} /> Back
                </button>
                <button
                  className="provider-btn pv-submit-btn"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </>
          )}

          {/* ══════════════ STEP 3: SUCCESS ══════════════ */}
          {step === 3 && (
            <div className="pv-success">
              <div className="pv-success-ring">
                <div className="pv-success-icon"><FiCheckCircle size={48} /></div>
              </div>
              <h2>Application Submitted!</h2>
              <p className="pv-success-desc">
                Thank you, <strong>{name}</strong>! Your application is now under review.
                Our admin team will verify your documents and get back to you within <strong>24–48 hours</strong>.
              </p>

              <div className="pv-success-steps">
                <div className="pv-ss-item pv-ss-done">
                  <FiCheckCircle size={16} />
                  <span>Application submitted</span>
                </div>
                <div className="pv-ss-item pv-ss-pending">
                  <FiClock size={16} />
                  <span>Admin review in progress</span>
                </div>
                <div className="pv-ss-item">
                  <FiCheckCircle size={16} />
                  <span>Account activated &amp; ready to mentor</span>
                </div>
              </div>

              <div className="pv-success-notice">
                <FiAlertCircle size={14} />
                You'll be able to log in once your application is approved.
              </div>

              <button className="provider-btn" onClick={() => navigate("/login")} style={{ marginTop: 24 }}>
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}