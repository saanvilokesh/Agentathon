
"use strict";

window.CFVisualizer = (() => {
  let steps = [];
  let index = 0;

  function display() {
    const element = document.getElementById("traceState");

    if (!steps.length) {
      element.textContent =
        "No verified execution trace available.";
      return;
    }

    const step = steps[index];

    element.textContent =
      `Step ${index + 1}/${steps.length}\n` +
      JSON.stringify(step, null, 2);
  }

  return {
    load(trace) {
      steps =
        trace?.status === "verified" &&
        Array.isArray(trace.steps)
          ? trace.steps
          : [];

      index = 0;

      document.getElementById("traceStatus").textContent =
        steps.length
          ? "Verified trace loaded"
          : trace?.reason || "Execution trace unavailable";

      display();
    },

    next() {
      if (!steps.length) return;

      index = Math.min(steps.length - 1, index + 1);
      display();
    },

    prev() {
      if (!steps.length) return;

      index = Math.max(0, index - 1);
      display();
    }
  };
})();
