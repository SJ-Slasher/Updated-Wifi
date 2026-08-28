import React from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="text-8xl mb-4">📡</div>
        <h1 className="text-4xl font-bold gradient-text mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page went offline. No signal found.</p>
        <button onClick={() => navigate("/")} className="btn-primary flex items-center gap-2 mx-auto">
          <Home size={16} /> Go Back Home
        </button>
      </div>
    </div>
  );
}
