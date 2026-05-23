import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "../utils/storage";

export default function ProtectedRoute({ children, allowedRoles }) {
  const auth = getAuth();

  if (!auth || !auth.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    if (auth.role === "user") {
      return <Navigate to="/user-home" replace />;
    }
    if (auth.role === "provider") {
      return <Navigate to="/provider-home" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
