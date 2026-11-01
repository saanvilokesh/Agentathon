"use strict";

const select = document.getElementById("sample");
const mount = document.getElementById("mount");

function pretty(slug) {
  return slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

for (const slug of Object.keys(window.CF_VIZ_SAMPLES)) {
  const option = document.createElement("option");
  option.value = slug;
  option.textContent = pretty(slug);
  select.append(option);
}

function show() {
  CFSolutionViz.mount(mount, window.CF_VIZ_SAMPLES[select.value]);
}

select.addEventListener("change", show);
const wanted = location.hash.slice(1);
if (wanted && window.CF_VIZ_SAMPLES[wanted]) select.value = wanted;
show();
