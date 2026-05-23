import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import "../styles/PageHeader.css";

export default function PageHeader({ title, subtitle, onBack, actionLabel, onAction }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft size={18} /> Back
          </button>
        )}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {actionLabel && onAction && (
        <button className="page-action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
