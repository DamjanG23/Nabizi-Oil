import { useState } from "react";
import "../styles/App.css";

export function LogoSelection() {
  //const [logo, setLogo] = useState<string | undefined>();
  const [logo] = useState<string | undefined>();

  const isLogoLoaded = logo !== undefined;

  return (
    <div className="logo-section">
      {isLogoLoaded ? (
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
          <button className="remove-logo-button" onClick={() => {}}>
            ✕
          </button>
        </div>
      ) : (
        <button className="upload-button" onClick={() => {}}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,5 17,10" />
            <line x1="12" y1="5" x2="12" y2="15" />
          </svg>
        </button>
      )}
    </div>
  );
}
