import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Layout from "@/components/layout/Layout";
import ToastContainer from "@/components/ui/ToastContainer";
import LoadingScreen from "@/components/ui/LoadingScreen";

const MapPage = lazy(() => import("@/pages/MapPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const LocationPage = lazy(() => import("@/pages/LocationPage"));
const NetworkPage = lazy(() => import("@/pages/NetworkPage"));
const AddWifiPage = lazy(() => import("@/pages/AddWifiPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<MapPage />} />
              <Route path="/location/:id" element={<LocationPage />} />
              <Route path="/network/:id" element={<NetworkPage />} />
              <Route path="/add-wifi" element={<AddWifiPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}
