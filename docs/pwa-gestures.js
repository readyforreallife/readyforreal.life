(function () {
  let startX = 0;
  let startY = 0;
  let active = false;
  const MOBILE_QUERY = "(max-width: 900px)";

  function shouldLockHorizontalPan() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  window.addEventListener(
    "touchstart",
    (event) => {
      if (!shouldLockHorizontalPan()) return;
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      active = true;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!active || !shouldLockHorizontalPan()) return;
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);
      if (deltaX > deltaY && deltaX > 8) {
        event.preventDefault();
      }
    },
    { passive: false },
  );

  window.addEventListener(
    "touchend",
    () => {
      active = false;
    },
    { passive: true },
  );

  document.documentElement.style.touchAction = "pan-y pinch-zoom";
  document.body.style.touchAction = "pan-y pinch-zoom";
})();
