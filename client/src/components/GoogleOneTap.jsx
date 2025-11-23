import { useEffect, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGoogleLoginMutation } from "../store/api/authApi";
import { setCredentials } from "../store/slices/authSlice";

const GoogleOneTap = ({ onError }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [googleLogin] = useGoogleLoginMutation();
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Load Google Identity Services script
    if (!scriptLoaded.current && window.google) {
      scriptLoaded.current = true;
      initializeGoogleOneTap();
    } else if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded.current = true;
        initializeGoogleOneTap();
      };
      document.head.appendChild(script);
    }

    function initializeGoogleOneTap() {
      if (!window.google) return;

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.error("VITE_GOOGLE_CLIENT_ID is not set in environment variables");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          locale: "en",
        }
      );

      // Show One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap is not available or was skipped
        }
      });
    }

    async function handleCredentialResponse(response) {
      try {
        const result = await googleLogin({
          credential: response.credential,
        }).unwrap();

        if (result.status === "success") {
          dispatch(
            setCredentials({
              user: result.data.user,
              token: result.data.token || null,
              refreshToken: result.data.refreshToken || null,
            })
          );
          navigate("/dashboard");
        }
      } catch (err) {
        const errorMessage =
          err?.data?.message || "Google login failed. Please try again.";
        if (onError) onError(errorMessage);
      }
    }
  }, [dispatch, navigate, googleLogin, onError]);

  return <div id="google-signin-button"></div>;
};

export default GoogleOneTap;

