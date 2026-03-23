import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download } from "lucide-react";

const QRCodeDownload = () => {
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    // In production, replace with your deployed URL
    // For now, use current origin
    setAppUrl(window.location.origin);
  }, []);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`;

  return (
    <Card className="max-w-md mx-auto animate-slide-in-left" style={{ animationDelay: '2s' }}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-blue-500" />
          Download HealthTrack App
        </CardTitle>
        <CardDescription>
          Scan this QR code with your phone's camera to open HealthTrack and install it as a PWA
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          <img
            src={qrCodeUrl}
            alt="QR Code to download HealthTrack app"
            width={200}
            height={200}
            className="rounded"
          />
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Or visit: <a href={appUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{appUrl}</a>
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Download className="h-4 w-4" />
          <span>Installable on iOS, Android, and desktop browsers</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDownload;
