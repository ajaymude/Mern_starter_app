import { useEffect, useRef } from "react";
import { useGoogleLoginMutation } from "../store/api/authApi";

const GoogleSignInButton = ({ onCredential, onError }) => {
  const [googleLogin] = useGoogleLoginMutation();
  const scriptLoaded = useRef(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (scriptLoaded.current) return;

      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        scriptLoaded.current = true;
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded.current = true;
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        if (onError) onError("Failed to load Google Sign-In script");
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!window.google || !buttonRef.current) {
        setTimeout(() => {
          if (window.google && buttonRef.current) {
            initializeGoogleSignIn();
          }
        }, 100);
        return;
      }

      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          throw new Error("VITE_GOOGLE_CLIENT_ID is not set in environment variables");
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          locale: "en",
          logo_alignment: "left",
        });
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        if (onError) onError("Failed to initialize Google Sign-In");
      }
    };

    const handleCredentialResponse = async (response) => {
      try {
        if (!response || !response.credential) {
          console.error("Invalid Google response:", response);
          if (onError) onError("Invalid response from Google");
          return;
        }

        const credential = response.credential;
        if (typeof credential !== "string") {
          console.error("Credential is not a string:", typeof credential, credential);
          if (onError) onError("Invalid credential format");
          return;
        }

        if (onCredential) {
          onCredential(credential);
        }
      } catch (error) {
        console.error("Error handling Google credential:", error);
        if (onError) onError("Failed to process Google credential");
      }
    };

    loadGoogleScript();
  }, [onCredential, onError, googleLogin]);

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleSignInButton;

