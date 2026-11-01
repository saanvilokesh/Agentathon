"use strict";

window.CFCompare = {
  draw(container, source, markLine, diff, side) {
    container.replaceChildren();
    const changeType = side === "user" ? "removed" : "added";
    const changedLines = new Set((diff || [])
      .filter(item => item.type === changeType)
      .map(item => item.line));
    (source || "").split("\\n").forEach((line, index) => {
      const element = document.createElement("span");
      element.className = "line";
      const lineNumber = index + 1;
      if (changedLines.has(lineNumber)) {
        element.classList.add(side === "user" ? "bad" : "added");
      }
      if (side === "user" && lineNumber === markLine) element.classList.add("highlight");
      element.textContent = String(lineNumber).padStart(3) + "  " + line;
      container.append(element);
    });
  },

  explain(container, diff) {
    container.replaceChildren();
    const changes = (diff || []).filter(item => item.type !== "same");
    if (!changes.length) {
      const p = document.createElement("p");
      p.textContent = "No line-level changes were generated.";
      container.append(p);
      return;
    }
    changes.forEach(item => {
      const card = document.createElement("div");
      card.className = "diff-item";
      const label = document.createElement("b");
      label.textContent = (item.type === "removed" ? "− Removed from your code · " : "+ Added in suggested code · ") + "line " + item.line;
      const code = document.createElement("div");
      code.className = item.type === "removed" ? "diff-old" : "diff-new";
      code.textContent = item.text || "(empty line)";
      card.append(label, code);
      container.append(card);
    });
  }
};
