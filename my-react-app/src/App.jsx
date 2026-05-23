import React, { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserSignup from "./pages/UserSignup";
import ProviderSignup from "./pages/ProviderSignup";
import UserHome from "./pages/UserHome";
import ProviderHome from "./pages/ProviderHome";

import Loader from "./components/Loader";

function App() {

  // ================= LOADING STATE =================

  const [loading, setLoading] = useState(true);

  // ================= LOADER EFFECT =================

  useEffect(() => {

    const timer = setTimeout(() => {

      setLoading(false);

    }, 2500);

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

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/user-signup"
          element={<UserSignup />}
        />

        <Route
          path="/provider-signup"
          element={<ProviderSignup />}
        />
        <Route
  path="/user-home"
  element={<UserHome />}
/>
<Route
  path="/provider-home"
  element={<ProviderHome />}
/>
      </Routes>

    </BrowserRouter>

  );
}

export default App;