import { useEffect, useRef, useState } from "react";

const GoogleSignInButton = ({ onCredential, onError }) => {
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // eslint-disable-next-line no-console
    console.log("Google Client ID check:", {
      hasClientId: !!clientId,
      clientId: clientId ? `${clientId.substring(0, 20)}...` : "not set",
      isPlaceholder: clientId?.includes("your-google-client-id"),
    });

    if (!clientId || clientId.includes("your-google-client-id")) {
      const errorMsg =
        "Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in client/.env.local and restart the dev server";
      // eslint-disable-next-line no-console
      console.error(errorMsg);
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }

    let retryCount = 0;
    const maxRetries = 50;
    let timeoutId = null;
    let initTimeout = null;

    const waitForGoogle = () => {
      if (window.google && window.google.accounts && buttonRef.current) {
        // eslint-disable-next-line no-console
        console.log("Google script loaded, initializing button...");
        initializeGoogleSignIn();
      } else if (retryCount < maxRetries) {
        retryCount++;
        // eslint-disable-next-line no-console
        console.log(
          `Waiting for Google script... (attempt ${retryCount}/${maxRetries})`,
          {
            hasGoogle: !!window.google,
            hasAccounts: !!(window.google && window.google.accounts),
            hasButtonRef: !!buttonRef.current,
          }
        );
        timeoutId = setTimeout(() => {
          waitForGoogle();
        }, 200);
      } else {
        const errorMsg =
          "Google Sign-In script failed to load. Please check your internet connection and refresh the page.";
        // eslint-disable-next-line no-console
        console.error("Google script timeout:", {
          hasGoogle: !!window.google,
          hasAccounts: !!(window.google && window.google.accounts),
          hasButtonRef: !!buttonRef.current,
          scriptInDOM: !!document.querySelector(
            'script[src*="accounts.google.com/gsi/client"]'
          ),
        });
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    };

    const initializeGoogleSignIn = () => {
      if (!window.google || !window.google.accounts || !buttonRef.current) {
        // eslint-disable-next-line no-console
        console.error("Cannot initialize - missing requirements:", {
          hasGoogle: !!window.google,
          hasAccounts: !!(window.google && window.google.accounts),
          hasButtonRef: !!buttonRef.current,
        });
        return;
      }

      try {
        // eslint-disable-next-line no-console
        console.log(
          "Initializing Google Sign-In with Client ID:",
          clientId.substring(0, 20) + "..."
        );

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        // eslint-disable-next-line no-console
        console.log("Rendering Google button...");
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          locale: "en",
          logo_alignment: "left",
        });

        // eslint-disable-next-line no-console
        console.log("Google button rendered successfully");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error initializing Google Sign-In:", error);
        const errorMsg = `Failed to initialize Google Sign-In: ${error.message}`;
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    };

    // Function to start waiting for Google script
    const startWaiting = () => {
      // Check if script is already in HTML
      const existingScript = document.querySelector(
        'script[src*="accounts.google.com/gsi/client"]'
      );

      if (window.google && window.google.accounts) {
        // Script already loaded, initialize immediately
        // eslint-disable-next-line no-console
        console.log("Google script already loaded");
        waitForGoogle();
      } else if (existingScript) {
        // Script tag exists in HTML, wait for it to load
        // eslint-disable-next-line no-console
        console.log("Google script tag found in HTML, waiting for load...");
        waitForGoogle();
      } else {
        // Script not found, add it dynamically
        // eslint-disable-next-line no-console
        console.log("Adding Google script dynamically...");
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onload = () => {
          // eslint-disable-next-line no-console
          console.log("Google script loaded dynamically");
          waitForGoogle();
        };
        script.onerror = (error) => {
          const errorMsg =
            "Failed to load Google Sign-In script. Please check your internet connection and try refreshing the page.";
          // eslint-disable-next-line no-console
          console.error("Script load error:", error, {
            scriptSrc: script.src,
            networkStatus: navigator.onLine ? "online" : "offline",
          });
          setError(errorMsg);
          if (onError) {
            onError(errorMsg);
          }
        };
        document.head.appendChild(script);
      }
    };

    // Start the process after a small delay to ensure DOM is ready
    initTimeout = setTimeout(() => {
      startWaiting();
    }, 100);

    const handleCredentialResponse = async (response) => {
      try {
        if (!response || !response.credential) {
          console.error("Invalid Google response:", response);
          if (onError) {
            onError("Invalid response from Google");
          }
          return;
        }

        const credential = response.credential;
        if (typeof credential !== "string") {
          console.error(
            "Credential is not a string:",
            typeof credential,
            credential
          );
          if (onError) {
            onError("Invalid credential format");
          }
          return;
        }

        if (onCredential) {
          onCredential(credential);
        }
      } catch (error) {
        console.error("Error handling Google credential:", error);
        if (onError) {
          onError("Failed to process Google credential");
        }
      }
    };

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, [onCredential, onError]);

  if (error) {
    return (
      <div
        className="w-full p-3 rounded text-sm text-center"
        style={{
          backgroundColor: "var(--color-danger-light)",
          color: "var(--text-error)",
        }}
      >
        Google Sign-In unavailable: {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleSignInButton;
