import React, { useEffect, useState } from "react";
import { initGoogleApi } from "./utils/googleApi";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserSignup from "./pages/UserSignup";
import ProviderSignup from "./pages/ProviderSignup";
import UserHome from "./pages/UserHome";
import ProviderHome from "./pages/ProviderHome";
import MentorsPage from "./pages/MentorsPage";
import BookingPage from "./pages/BookingPage";
import SessionsPage from "./pages/SessionsPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfileView from "./pages/UserProfileView";
import ProviderProfileView from "./pages/ProviderProfileView";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProviderCalendar from "./pages/ProviderCalendar";
import MeetingRoom from "./pages/MeetingRoom";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminDashboard from "./pages/AdminDashboard";
import LeaveReviewPage from "./pages/LeaveReviewPage";

import ProtectedRoute from "./Components/ProtectedRoute";
import Loader from "./Components/Loader";

function App() {

  // ================= LOADING STATE =================

  const [loading, setLoading] = useState(true);

  // ================= LOADER EFFECT =================

  useEffect(() => {

    // ── Loader timer ──────────────────────────────────────────
    const timer = setTimeout(() => {

      setLoading(false);

    }, 2500);

    // ── Google Calendar & Meet API initialization ─────────────
    // Runs in the background at startup. If credentials are not
    // yet configured, this will log a warning but NOT break the app.
    initGoogleApi().catch((err) =>
      console.warn("[App] Google API init failed (check credentials):", err)
    );

    return () => clearTimeout(timer);

  }, []);

  // ================= SHOW LOADER =================

  if (loading) {
    return <Loader />;
  }

  // ================= ROUTES =================

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user-signup" element={<UserSignup />} />
        <Route path="/provider-signup" element={<ProviderSignup />} />

        <Route
          path="/user-home"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/provider-home"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentors"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <MentorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <SessionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meeting/:id"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["user", "provider"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-profile/:email"
          element={
            <ProtectedRoute allowedRoles={["user", "provider", "admin"]}>
              <UserProfileView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/provider-profile/:email"
          element={
            <ProtectedRoute allowedRoles={["user", "provider", "admin"]}>
              <ProviderProfileView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave-review"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <LeaveReviewPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter>

  );
}

export default App;