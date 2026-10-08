/**
 * كافيه مراحب (Mara7eb Café) - Fullscreen Menu Picture Viewer
 * Smooth Touch Gestures, Pinch-to-Zoom, Pan, and Fullscreen Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  const viewerContainer = document.getElementById("viewerContainer");
  const panZoomLayer = document.getElementById("panZoomLayer");
  const menuImage = document.getElementById("menuImage");

  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  // State
  let scale = 1;
  let panX = 0;
  let panY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  let lastTapTime = 0;
  let initialPinchDistance = null;
  let initialScale = 1;

  // Apply Transform
  function applyTransform() {
    panZoomLayer.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
    if (scale > 1) {
      viewerContainer.style.cursor = isDragging ? "grabbing" : "grab";
    } else {
      viewerContainer.style.cursor = "default";
    }
  }

  // Set Scale with Boundaries
  function setScale(newScale) {
    scale = Math.max(1, Math.min(newScale, 4.5));
    if (scale === 1) {
      panX = 0;
      panY = 0;
    }
    applyTransform();
  }

  // Haptic feedback for touch devices
  function triggerHaptic(duration = 20) {
    if (navigator && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }

  // 1. Controls Toolbar
  zoomInBtn.addEventListener("click", () => {
    triggerHaptic();
    setScale(scale + 0.4);
  });

  zoomOutBtn.addEventListener("click", () => {
    triggerHaptic();
    setScale(scale - 0.4);
  });

  zoomResetBtn.addEventListener("click", () => {
    triggerHaptic();
    setScale(1);
  });

  // Fullscreen toggle
  fullscreenBtn.addEventListener("click", () => {
    triggerHaptic();
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  });

  // 2. Mouse Drag & Wheel (Desktop)
  viewerContainer.addEventListener("mousedown", (e) => {
    if (scale <= 1) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    viewerContainer.classList.add("grabbing");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      viewerContainer.classList.remove("grabbing");
    }
  });

  viewerContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale(scale + delta);
  }, { passive: false });

  // Double click to zoom on desktop
  viewerContainer.addEventListener("dblclick", (e) => {
    e.preventDefault();
    if (scale > 1) {
      setScale(1);
    } else {
      setScale(2.2);
    }
  });

  // 3. Touch Gestures (Mobile Pinch-to-Zoom & Pan)
  viewerContainer.addEventListener("touchstart", (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    // Double-tap to zoom
    if (e.touches.length === 1 && tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      triggerHaptic(25);
      if (scale > 1) {
        setScale(1);
      } else {
        setScale(2.2);
      }
      lastTapTime = 0;
      return;
    }
    lastTapTime = currentTime;

    // 1 Finger pan when zoomed
    if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      startX = e.touches[0].clientX - panX;
      startY = e.touches[0].clientY - panY;
    }
    // 2 Fingers pinch-to-zoom
    else if (e.touches.length === 2) {
      isDragging = false;
      initialPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = scale;
    }
  }, { passive: false });

  viewerContainer.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      panX = e.touches[0].clientX - startX;
      panY = e.touches[0].clientY - startY;
      applyTransform();
    } else if (e.touches.length === 2 && initialPinchDistance) {
      e.preventDefault();
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDistance / initialPinchDistance;
      setScale(initialScale * factor);
    }
  }, { passive: false });

  viewerContainer.addEventListener("touchend", () => {
    isDragging = false;
    initialPinchDistance = null;
  });
});
