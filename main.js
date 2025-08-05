// main.js - External JavaScript file for CheekyMow website

// Google Analytics Setup
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-XVP4CEMY37");

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("ServiceWorker registration successful");
      })
      .catch(function (err) {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

// DOM Content Loaded Event Listener
document.addEventListener("DOMContentLoaded", function () {
  // Dark Mode Toggle
  const toggleButton = document.getElementById("dark-mode-toggle");
  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");

      // Save preference to localStorage
      const isDarkMode = document.body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDarkMode);
    });

    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      document.body.classList.add("dark-mode");
    }
  }

  // Jump to Top Button
  const jumpToTopButton = document.getElementById("jump-to-top");
  if (jumpToTopButton) {
    window.addEventListener("scroll", function () {
      jumpToTopButton.style.display = window.scrollY > 200 ? "block" : "none";
    });

    jumpToTopButton.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Testimonials Carousel
  const slides = document.querySelectorAll(".carousel-slide");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach(function (slide, idx) {
      slide.classList.remove("active");
      if (idx === index) {
        slide.classList.add("active");
      }
    });
  }

  if (prevBtn && nextBtn && slides.length > 0) {
    prevBtn.addEventListener("click", function () {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });

    nextBtn.addEventListener("click", function () {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });

    // Auto-advance carousel every 5 seconds
    setInterval(function () {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  // Lawn Calculator
  const calculatorForm = document.getElementById("lawn-calculator-form");
  const calculatorResult = document.getElementById("calculator-result");
  const waterFrequency = document.getElementById("water-frequency");
  const fertilizerAdvice = document.getElementById("fertilizer-advice");

  if (calculatorForm) {
    calculatorForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const sizeValue = Number(document.getElementById("lawn-size").value);
      const grassType = document.getElementById("grass-type").value;

      if (!sizeValue || !grassType) {
        alert("Please fill in all fields");
        return;
      }

      let frequency = grassType === "warm-season" ? 3 : 2;
      let fertilizer =
        grassType === "warm-season"
          ? "Use a nitrogen-rich fertilizer monthly in summer."
          : "Use a balanced fertilizer in spring and fall.";

      if (waterFrequency) {
        waterFrequency.textContent = `Recommended watering: ~${frequency} times per week for ${sizeValue.toLocaleString()} sq. ft.`;
      }
      if (fertilizerAdvice) {
        fertilizerAdvice.textContent = fertilizer;
      }

      if (calculatorResult) {
        calculatorResult.style.display = "block";
        calculatorResult.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  }, observerOptions);

  // Observe feature cards for animation
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach(function (card) {
    observer.observe(card);
  });

  // Form validation enhancement
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach(function (input) {
    input.addEventListener("blur", function () {
      validateField(this);
    });
  });

  function validateField(field) {
    const value = field.value.trim();

    if (field.hasAttribute("required") && !value) {
      field.classList.add("error");
      showFieldError(field, "This field is required");
    } else if (field.type === "number" && value && isNaN(value)) {
      field.classList.add("error");
      showFieldError(field, "Please enter a valid number");
    } else {
      field.classList.remove("error");
      hideFieldError(field);
    }
  }

  function showFieldError(field, message) {
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains("field-error")) {
      errorElement = document.createElement("div");
      errorElement.className = "field-error";
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    errorElement.textContent = message;
  }

  function hideFieldError(field) {
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains("field-error")) {
      errorElement.remove();
    }
  }
});

// Error handling for any uncaught errors
window.addEventListener("error", function (e) {
  console.error("JavaScript error:", e.error);
  // You could send this to your analytics or error reporting service
});

// Performance monitoring
window.addEventListener("load", function () {
  // Log page load time
  const loadTime = performance.now();
  console.log(`Page loaded in ${Math.round(loadTime)}ms`);

  // Send to analytics if needed
  if (typeof gtag !== "undefined") {
    gtag("event", "page_load_time", {
      event_category: "Performance",
      value: Math.round(loadTime),
    });
  }
});
