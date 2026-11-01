
"use strict";

const LANGUAGES = [
  "C++", "Python3", "Python", "Java",
  "JavaScript", "TypeScript", "C", "C#",
  "Go", "Rust"
];

function getSlug() {
  return location.pathname.match(
    /^\/problems\/([^/]+)/
  )?.[1] || "";
}

function getTitle() {
  const selectors = [
    '[data-cy="question-title"]',
    '[data-e2e-locator="question-title"]',
    'a[href^="/problems/"][class*="cursor-pointer"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);

    if (element?.innerText?.trim()) {
      return element.innerText
        .trim()
        .replace(/^\d+\.\s*/, "");
    }
  }

  const slug = getSlug();

  return slug
    .split("-")
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function getStatement() {
  const selectors = [
    '[data-track-load="description_content"]',
    '[data-cy="question-content"]',
    ".question-content"
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);

    for (const element of elements) {
      const text = element.innerText?.trim() || "";

      if (text.length > 80) {
        return text;
      }
    }
  }

  return "";
}

function getLanguage() {
  const button = [...document.querySelectorAll("button")]
    .find(element =>
      LANGUAGES.includes(element.innerText?.trim())
    );

  return button?.innerText?.trim() || "";
}

function getVerdict() {
  const element = document.querySelector(
    '[data-e2e-locator="submission-result"]'
  );

  return element?.innerText?.trim() || "";
}

function getDomCode() {
  const lines = document.querySelectorAll(
    ".monaco-editor .view-line"
  );

  return [...lines]
    .map(line =>
      line.innerText.replace(/\u00a0/g, " ")
    )
    .join("\n");
}

function extractProblem() {
  const slugBefore = getSlug();

  const result = {
    slug: slugBefore,
    title: getTitle(),
    statement: getStatement(),
    language: getLanguage(),
    verdict: getVerdict(),
    domCode: getDomCode(),
    pageUrl: location.href
  };

  if (getSlug() !== slugBefore) {
    return {
      error: "The problem changed. Click Sync again."
    };
  }

  if (!result.slug || !result.statement) {
    return {
      error:
        "Problem description not loaded. Refresh LeetCode and retry."
    };
  }

  return result;
}

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.action === "getLeetCodeCode") {
      sendResponse(extractProblem());
    }
  }
);
