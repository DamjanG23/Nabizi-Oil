import { useEffect, useState } from "react";
import "../../styles/App.css";
import "./logoSelection.css";

export function LogoSelection() {
  useEffect(() => {
    async function fetchLogo() {
      const logoBase64 = await window.electron.getLogoBase64();
      setLogo(logoBase64 ?? undefined);
    }
    fetchLogo();
  }, []);

  const [logo, setLogo] = useState<string | undefined>();

  return (
    <div className="logo-section">
      <div className="logo-container">
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
          onError={(e) => {
            console.error("Image failed to load:", e);
            console.log("Image src:", logo);
          }}
        />
      </div>
    </div>
  );
}
