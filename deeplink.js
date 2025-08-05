// deeplink.js - CSP-compliant deep link handler for CheekyMow

// Configuration
const DEEPLINK_CONFIG = {
  scheme: "cheekymow://",
  fallbackUrl: "https://cheekymow.au",
  timeout: 3000, // 3 seconds
  playStoreUrl:
    "https://play.google.com/store/apps/details?id=com.companyname.cheekymow",
  // appStoreUrl: 'https://apps.apple.com/app/cheekymow/idXXXXXXXXX', // Add when iOS app is available
};

// Deep link functionality
class DeepLinkHandler {
  constructor() {
    this.userAgent = navigator.userAgent || navigator.vendor || window.opera;
    this.isAndroid = /android/i.test(this.userAgent);
    this.isIOS = /iPad|iPhone|iPod/.test(this.userAgent) && !window.MSStream;
    this.isMobile = this.isAndroid || this.isIOS;
    this.startTime = Date.now();
    this.hasAppOpened = false;

    this.init();
  }

  init() {
    // Get the intended route from the current page
    const route = this.getRouteFromPath();

    // Try to open the app immediately
    this.attemptAppOpen(route);

    // Set up fallback mechanisms
    this.setupFallbacks();

    // Setup analytics if available
    this.trackDeepLinkAttempt(route);
  }

  getRouteFromPath() {
    const path = window.location.pathname;
    if (path.includes("profile")) {
      return "profile";
    } else if (path.includes("upgrade")) {
      return "upgrade";
    }
    return "";
  }

  attemptAppOpen(route) {
    const deepLinkUrl = `${DEEPLINK_CONFIG.scheme}${route}`;

    if (this.isAndroid) {
      this.tryAndroidAppOpen(deepLinkUrl, route);
    } else if (this.isIOS) {
      this.tryIOSAppOpen(deepLinkUrl, route);
    } else {
      // Desktop - show fallback immediately
      this.showFallback();
    }
  }

  tryAndroidAppOpen(deepLinkUrl, route) {
    // Method 1: Try intent URL (preferred for Android)
    const intentUrl = `intent://${route}#Intent;scheme=cheekymow;package=com.companyname.cheekymow;S.browser_fallback_url=${encodeURIComponent(
      DEEPLINK_CONFIG.playStoreUrl
    )};end`;

    // Try the intent URL first
    this.redirectTo(intentUrl);

    // Fallback to custom scheme if intent doesn't work
    setTimeout(() => {
      if (!this.hasAppOpened) {
        this.redirectTo(deepLinkUrl);
      }
    }, 100);
  }

  tryIOSAppOpen(deepLinkUrl, route) {
    // For iOS, try the custom scheme directly
    this.redirectTo(deepLinkUrl);

    // iOS Universal Links would be handled automatically by the system
    // if properly configured in the app and server
  }

  redirectTo(url) {
    try {
      // Try using window.location first
      window.location.href = url;

      // Mark that we attempted to open the app
      this.hasAppOpened = true;
    } catch (error) {
      console.log("Direct redirect failed, trying alternative method");

      // Alternative method using a hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      // Clean up the iframe after a short delay
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1000);
    }
  }

  setupFallbacks() {
    // Show fallback after timeout
    setTimeout(() => {
      this.showFallback();
    }, DEEPLINK_CONFIG.timeout);

    // Listen for page visibility changes (indicates app might have opened)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Page became hidden, likely app opened
        this.hasAppOpened = true;
      } else if (!document.hidden && !this.hasAppOpened) {
        // Page became visible again without app opening - show fallback
        setTimeout(() => {
          this.showFallback();
        }, 500);
      }
    });

    // Listen for blur events (another indicator app might have opened)
    window.addEventListener("blur", () => {
      this.hasAppOpened = true;
    });

    // Listen for focus events
    window.addEventListener("focus", () => {
      if (!this.hasAppOpened) {
        setTimeout(() => {
          this.showFallback();
        }, 300);
      }
    });
  }

  showFallback() {
    // Hide spinner
    const spinner = document.querySelector(".spinner");
    if (spinner) {
      spinner.style.display = "none";
    }

    // Show fallback link
    const fallbackLink = document.getElementById("fallback-link");
    if (fallbackLink) {
      fallbackLink.style.display = "inline-block";
    }

    // Update text content
    const mainText = document.querySelector("p");
    if (mainText) {
      mainText.textContent =
        "App didn't open? No problem - visit our website instead.";
    }

    // Track fallback shown
    this.trackFallbackShown();
  }

  trackDeepLinkAttempt(route) {
    // Google Analytics tracking if available
    if (typeof gtag !== "undefined") {
      gtag("event", "deeplink_attempt", {
        event_category: "App Integration",
        event_label: route,
        transport_type: "beacon",
      });
    }

    // Console log for debugging
    console.log(`Attempting to open app with route: ${route}`);
  }

  trackFallbackShown() {
    if (typeof gtag !== "undefined") {
      gtag("event", "deeplink_fallback_shown", {
        event_category: "App Integration",
        time_elapsed: Date.now() - this.startTime,
        transport_type: "beacon",
      });
    }

    console.log("Fallback shown after", Date.now() - this.startTime, "ms");
  }
}

// Enhanced app detection
class AppDetector {
  static isAppInstalled(callback) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "cheekymow://ping";

    const timeout = setTimeout(() => {
      callback(false);
    }, 1000);

    iframe.onload = () => {
      clearTimeout(timeout);
      callback(true);
    };

    document.body.appendChild(iframe);

    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 2000);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize on mobile or if specifically requested
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const forceDeepLink = new URLSearchParams(window.location.search).has(
    "deeplink"
  );

  if (isMobile || forceDeepLink) {
    new DeepLinkHandler();
  } else {
    // Desktop - redirect to main site immediately
    setTimeout(() => {
      window.location.href = DEEPLINK_CONFIG.fallbackUrl;
    }, 1000);
  }

  // Add click handlers for manual fallback
  const fallbackLink = document.getElementById("fallback-link");
  if (fallbackLink) {
    fallbackLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = DEEPLINK_CONFIG.fallbackUrl;
    });
  }

  // Enhanced download button tracking
  const downloadButtons = document.querySelectorAll(".download-btn");
  downloadButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const buttonText = button.textContent.trim();
      if (typeof gtag !== "undefined") {
        gtag("event", "download_button_click", {
          event_category: "App Download",
          event_label: buttonText,
          transport_type: "beacon",
        });
      }
    });
  });
});

// Export for potential use in other scripts
window.CheekyMowDeepLink = {
  DeepLinkHandler,
  AppDetector,
  config: DEEPLINK_CONFIG,
};
