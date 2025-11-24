import { useEffect, useRef, useState } from "react";

const GoogleSignInButton = ({ onCredential, onError }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Get client ID from environment variable
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Debug: Log environment check
    // eslint-disable-next-line no-console
    console.log("Google Client ID Environment Check:", {
      hasClientId: !!clientId,
      clientIdLength: clientId?.length || 0,
      clientIdPreview: clientId ? `${clientId.substring(0, 30)}...` : "not set",
      isPlaceholder: clientId?.includes("your-google-client-id"),
      allViteEnvKeys: Object.keys(import.meta.env).filter((k) =>
        k.startsWith("VITE_")
      ),
    });

    // Validate client ID
    // Check if clientId is missing, empty, or is a placeholder
    const isValidClientId =
      clientId &&
      typeof clientId === "string" &&
      clientId.trim().length > 0 &&
      !clientId.includes("your-google-client-id") &&
      clientId.includes(".apps.googleusercontent.com");

    if (!isValidClientId) {
      // Check if we're in production mode
      const isProduction =
        import.meta.env.PROD === true || import.meta.env.MODE === "production";
      const errorMsg = isProduction
        ? "Google Client ID not configured. The client was built without VITE_GOOGLE_CLIENT_ID. Please rebuild: cd client && npm run build"
        : "Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in client/.env.local and restart the dev server";
      // eslint-disable-next-line no-console
      console.error("Google Client ID Error:", {
        error: errorMsg,
        isProduction,
        hasClientId: !!clientId,
        clientIdValue: clientId
          ? `${clientId.substring(0, 50)}...`
          : "undefined",
        clientIdType: typeof clientId,
        clientIdLength: clientId?.length || 0,
        isValidClientId: false,
      });
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }

    // Clear any previous error state
    setError(null);
    setIsLoading(true);

    // eslint-disable-next-line no-console
    console.log(
      "Google Client ID is valid, proceeding with initialization...",
      {
        clientIdPreview: `${clientId.substring(0, 30)}...`,
      }
    );

    // Define handleCredentialResponse first so it's available for initializeGoogleSignIn
    const handleCredentialResponse = async (response) => {
      try {
        // eslint-disable-next-line no-console
        console.log("Google credential received:", {
          hasResponse: !!response,
          hasCredential: !!(response && response.credential),
          credentialType: response?.credential
            ? typeof response.credential
            : "none",
          credentialLength: response?.credential?.length || 0,
        });

        if (!response || !response.credential) {
          // eslint-disable-next-line no-console
          console.error("Invalid Google response:", response);
          if (onError) {
            onError("Invalid response from Google");
          }
          return;
        }

        const credential = response.credential;
        if (typeof credential !== "string") {
          // eslint-disable-next-line no-console
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

        // eslint-disable-next-line no-console
        console.log("Calling onCredential callback with credential...");
        if (onCredential) {
          onCredential(credential);
        } else {
          // eslint-disable-next-line no-console
          console.error("onCredential callback is not provided!");
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error handling Google credential:", error);
        if (onError) {
          onError(`Failed to process Google credential: ${error.message}`);
        }
      }
    };

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
        setIsLoading(false);
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
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });

        // eslint-disable-next-line no-console
        console.log("Rendering Google button...");
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          locale: "en",
          logo_alignment: "left",
        });

        // eslint-disable-next-line no-console
        console.log("Google button rendered successfully");

        // Check if button was actually rendered
        // Google renders the button asynchronously, so we check multiple ways
        let checkCount = 0;
        const maxChecks = 30; // Max 3 seconds of checking
        const checkButtonRendered = () => {
          checkCount++;

          // Check multiple ways the button might be rendered
          const hasChildren = buttonRef.current?.children.length > 0;
          const hasInnerHTML = buttonRef.current?.innerHTML.trim().length > 0;
          const hasIframe = buttonRef.current?.querySelector("iframe") !== null;
          const hasButton = buttonRef.current?.querySelector("button") !== null;
          const isRendered =
            hasChildren || hasInnerHTML || hasIframe || hasButton;

          if (isRendered) {
            // eslint-disable-next-line no-console
            console.log("Google button confirmed rendered in DOM", {
              hasChildren,
              hasInnerHTML,
              hasIframe,
              hasButton,
            });
            setIsLoading(false);
          } else if (checkCount < maxChecks) {
            // Retry check after a short delay
            setTimeout(checkButtonRendered, 100);
          } else {
            // Timeout - hide loading anyway (button might be there but not detected)
            // eslint-disable-next-line no-console
            console.warn(
              "Google button render check timeout - hiding loading state anyway",
              {
                hasChildren,
                hasInnerHTML,
                hasIframe,
                hasButton,
                innerHTML: buttonRef.current?.innerHTML?.substring(0, 100),
              }
            );
            setIsLoading(false);
          }
        };

        // Start checking after a short delay to allow Google to render
        setTimeout(checkButtonRendered, 300);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error initializing Google Sign-In:", error);
        const errorMsg = `Failed to initialize Google Sign-In: ${error.message}`;
        setError(errorMsg);
        setIsLoading(false);
        if (onError) {
          onError(errorMsg);
        }
      }
    };

    // eslint-disable-next-line no-console
    console.log("Google Debug ⬇⬇⬇");
    // eslint-disable-next-line no-console
    console.log(
      "VITE_GOOGLE_CLIENT_ID:",
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    );
    // eslint-disable-next-line no-console
    console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
    // eslint-disable-next-line no-console
    console.log("NODE_ENV:", import.meta.env.MODE);

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
          setIsLoading(false);
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
    <div className="w-full" style={{ minHeight: "40px", position: "relative" }}>
      <div
        ref={buttonRef}
        className="w-full"
        style={{ minHeight: "40px" }}
      ></div>
      {isLoading && (
        <div
          className="w-full p-3 rounded text-sm text-center absolute inset-0 flex items-center justify-center"
          style={{
            color: "var(--text-tertiary)",
            backgroundColor: "var(--bg-card)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          Loading Google Sign-In...
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
