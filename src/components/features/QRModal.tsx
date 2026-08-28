import React, { useEffect, useRef } from "react";
import { X, Download, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { generateWifiQR } from "@/lib/utils";

interface QRModalProps {
  ssid: string;
  password: string;
  locationName: string;
  onClose: () => void;
}

export default function QRModal({ ssid, password, locationName, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const qrString = generateWifiQR(ssid, password);
    QRCode.toCanvas(canvasRef.current, qrString, {
      width: 240,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#f1f5f9",
      },
    });
  }, [ssid, password]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${ssid}-wifi-qr.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-card p-6 w-full max-w-sm animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-lg">Scan to Connect</h3>
            <p className="text-sm text-muted-foreground">{locationName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-slate-100 rounded-xl">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 mb-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Network</p>
          <p className="font-mono font-medium text-cyan-400">{ssid}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 rounded-lg p-3 mb-4">
          <Smartphone size={14} className="flex-shrink-0 text-cyan-400" />
          <p>Point your phone camera at the QR code to automatically connect to this WiFi network.</p>
        </div>

        <button
          onClick={handleDownload}
          className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
        >
          <Download size={16} />
          <span>Download QR Code</span>
        </button>
      </div>
    </div>
  );
}
