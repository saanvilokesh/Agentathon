"use strict";

/*
 * Cognitive Fingerprint - solution visualizer (renderer + step player).
 *
 * Draws an AI-generated "diagram script" for any problem. Every block type is
 * drawn with plain DOM/SVG and textContent only (never innerHTML), because the
 * script is derived from untrusted problem text.
 *
 * Public API:
 *   CFSolutionViz.mount(container, spec)  -> controller { go, next, prev, play, pause, destroy }
 *   CFSolutionViz.drawBlock(block)        -> HTMLElement (one structure, used by the demo/tests)
 */
window.CFSolutionViz = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const W = 372;
  let uid = 0;
  let active = null;

  // ---------------------------------------------------------------- helpers

  const S = (value, limit = 40) => {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/\s+/g, " ").trim();
    return text.length > limit ? text.slice(0, limit - 1) + "…" : text;
  };

  function h(tag, className, text, parent) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }

  function sv(tag, attrs, parent, text) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
    if (text !== undefined && text !== null) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }

  const list = value => (Array.isArray(value) ? value : []);
  const has = (value, item) => list(value).includes(item);

  function stateOf(block, index) {
    if (has(block.highlight, index)) return "active";
    if (has(block.done, index)) return "done";
    if (has(block.dim, index)) return "dim";
    return "idle";
  }

  function newSvg(width, height, label) {
    const id = ++uid;
    const svg = sv("svg", {
      viewBox: `0 0 ${width} ${height}`,
      class: "vz-svg",
      role: "img",
      "aria-label": label || "diagram",
      preserveAspectRatio: "xMidYMid meet"
    });
    const defs = sv("defs", {}, svg);
    const arrows = {};
    for (const [name, color] of [["idle", "#8a97b8"], ["active", "#ff8a3d"], ["done", "#36b88a"], ["dim", "#4a5470"]]) {
      const marker = sv("marker", {
        id: `vzArrow${id}${name}`, viewBox: "0 0 10 10", refX: 8, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse"
      }, defs);
      sv("path", { d: "M0,0 L10,5 L0,10 z", fill: color }, marker);
      arrows[name] = `url(#vzArrow${id}${name})`;
    }
    svg.style.aspectRatio = `${width} / ${height}`;
    return { svg, arrows };
  }

  /* Stagger name tags that would overlap: returns a row (0..2) for each item. */
  function stagger(items) {
    const rows = [];
    const order = items.map((item, i) => i).sort((a, b) => items[a].x - items[b].x);
    const ends = [-Infinity, -Infinity, -Infinity];
    const result = new Array(items.length).fill(0);
    for (const i of order) {
      const width = items[i].text.length * 5.6 + 8;
      const left = items[i].x - width / 2;
      let row = ends.findIndex(end => end < left);
      if (row < 0) row = 2;
      ends[row] = items[i].x + width / 2;
      result[i] = row;
    }
    return result;
  }

  function groupPointers(pointers, key) {
    const groups = new Map();
    for (const pointer of list(pointers)) {
      const k = pointer[key];
      groups.set(k, (groups.get(k) || []).concat(S(pointer.name, 10)));
    }
    return [...groups.entries()].map(([k, names]) => ({ key: k, text: names.join(",") }));
  }

  function tag(svg, x, y, text, anchor = "middle") {
    sv("polygon", { points: `${x - 4},${y + 5} ${x + 4},${y + 5} ${x},${y}`, class: "vz-ptr" }, svg);
    sv("text", { x, y: y + 15, "text-anchor": anchor, class: "vz-ptr-text" }, svg, text);
  }

  // ---------------------------------------------------------------- drawers

  function drawArray(b) {
    const values = list(b.values);
    const n = values.length;
    const cw = Math.min(54, Math.floor((W - 16) / n));
    const x0 = (W - cw * n) / 2;
    const nums = values.map(Number);
    const bars = b.style === "bars" && nums.every(x => Number.isFinite(x) && x >= 0);
    const top = b.window ? 24 : 8;
    const body = bars ? 100 : 38;
    const tags = groupPointers(b.pointers, "index").map(g => ({ ...g, x: x0 + g.key * cw + cw / 2 }));
    const rows = stagger(tags);
    const maxRow = rows.length ? Math.max(...rows) + 1 : 0;
    const height = top + body + 16 + (maxRow ? 8 + maxRow * 13 + 8 : 6);
    const { svg } = newSvg(W, height, b.label || "array");
    const fs = Math.max(8, Math.min(14, cw * 0.4));

    if (bars) {
      const peak = Math.max(...nums, 1);
      const base = top + body;
      values.forEach((value, i) => {
        const barH = Math.max(2, (nums[i] / peak) * (body - 16));
        sv("rect", { x: x0 + i * cw + 2, y: base - barH, width: cw - 4, height: barH, rx: 2, class: `vz-bar vz-${stateOf(b, i)}` }, svg);
        if (cw >= 16) sv("text", { x: x0 + i * cw + cw / 2, y: base - barH - 3, "text-anchor": "middle", class: "vz-small" }, svg, S(value, 4));
      });
      sv("line", { x1: x0, x2: x0 + cw * n, y1: base, y2: base, class: "vz-axis" }, svg);
    } else {
      values.forEach((value, i) => {
        sv("rect", { x: x0 + i * cw + 1, y: top, width: cw - 2, height: body, rx: 4, class: `vz-cell vz-${stateOf(b, i)}` }, svg);
        sv("text", { x: x0 + i * cw + cw / 2, y: top + body / 2 + fs * 0.35, "text-anchor": "middle", class: `vz-val vz-t-${stateOf(b, i)}`, "font-size": fs }, svg, S(value, cw < 26 ? 3 : 8));
      });
    }
    values.forEach((_, i) => sv("text", { x: x0 + i * cw + cw / 2, y: top + body + 11, "text-anchor": "middle", class: "vz-idx" }, svg, i));

    if (b.window && Number.isInteger(b.window.from) && Number.isInteger(b.window.to)) {
      const a = x0 + b.window.from * cw;
      const z = x0 + (b.window.to + 1) * cw;
      sv("rect", { x: a, y: top - 4, width: z - a, height: body + 8, rx: 6, class: "vz-window" }, svg);
      sv("text", { x: a + 2, y: top - 8, class: "vz-window-text" }, svg, S(b.window.label || "window", 16));
    }
    tags.forEach((t, i) => tag(svg, t.x, top + body + 18 + rows[i] * 13, t.text));
    return svg;
  }

  function drawGrid(b) {
    const rows = list(b.rows).map(r => list(r));
    const R = rows.length;
    const C = Math.max(...rows.map(r => r.length), 1);
    const gutter = 14;
    const cs = Math.min(42, Math.floor((W - gutter - 12) / C));
    const x0 = (W - (cs * C + gutter)) / 2 + gutter;
    const y0 = gutter + 4;
    const { svg } = newSvg(W, y0 + R * cs + 8, b.label || "grid");
    const key = (r, c) => `${r},${c}`;
    const sets = {};
    for (const name of ["highlight", "done", "dim"]) sets[name] = new Set(list(b[name]).map(p => key(p[0], p[1])));
    const marks = new Map(list(b.pointers).map(p => [key(p.row, p.col), S(p.name, 8)]));
    for (let c = 0; c < C; c++) sv("text", { x: x0 + c * cs + cs / 2, y: y0 - 4, "text-anchor": "middle", class: "vz-idx" }, svg, c);
    for (let r = 0; r < R; r++) {
      sv("text", { x: x0 - 5, y: y0 + r * cs + cs / 2 + 3, "text-anchor": "end", class: "vz-idx" }, svg, r);
      for (let c = 0; c < C; c++) {
        const k = key(r, c);
        const state = sets.highlight.has(k) ? "active" : sets.done.has(k) ? "done" : sets.dim.has(k) ? "dim" : "idle";
        const text = S(rows[r][c], 6);
        sv("rect", { x: x0 + c * cs + 1, y: y0 + r * cs + 1, width: cs - 2, height: cs - 2, rx: 4, class: `vz-cell vz-${state}${marks.has(k) ? " vz-marked" : ""}` }, svg);
        const fs = Math.max(8, Math.min(13, cs * 0.42, (cs - 6) / Math.max(1, text.length) * 1.5));
        sv("text", { x: x0 + c * cs + cs / 2, y: y0 + r * cs + cs / 2 + fs * 0.35, "text-anchor": "middle", class: `vz-val vz-t-${state}`, "font-size": fs }, svg, text);
        if (marks.has(k)) sv("text", { x: x0 + c * cs + 3, y: y0 + r * cs + 9, class: "vz-ptr-text vz-corner" }, svg, marks.get(k));
      }
    }
    return svg;
  }

  function drawLinkedList(b) {
    const values = list(b.values);
    const n = values.length;
    const next = Array.isArray(b.next) && b.next.length === n
      ? b.next.map(v => (Number.isInteger(v) && v >= 0 && v <= n ? v : n))
      : values.map((_, i) => i + 1);
    const pointers = list(b.pointers);
    const lead = pointers.some(p => p.index < 0) ? 1 : 0;
    const slots = n + lead + 1;
    const PER = 6, SW = 58, NW = 38, NH = 30, ROW = 98, TOP = 34;
    const rowsCount = Math.ceil(slots / PER);
    const { svg, arrows } = newSvg(W, TOP + rowsCount * ROW - 20, b.label || "linked list");
    const pos = slot => ({ x: 12 + (slot % PER) * SW, y: TOP + Math.floor(slot / PER) * ROW, row: Math.floor(slot / PER) });
    const slotOf = i => i + lead;

    // null placeholders
    const nullBox = slot => {
      const p = pos(slot);
      sv("rect", { x: p.x + 4, y: p.y + 4, width: NW - 8, height: NH - 8, rx: 4, class: "vz-null" }, svg);
      sv("text", { x: p.x + NW / 2, y: p.y + NH / 2 + 3, "text-anchor": "middle", class: "vz-small" }, svg, "null");
    };
    if (lead) nullBox(0);
    nullBox(slotOf(n));

    // links
    next.forEach((target, i) => {
      const a = pos(slotOf(i)), t = pos(slotOf(target));
      const state = stateOf(b, i);
      const cls = `vz-link vz-l-${state === "dim" ? "dim" : "idle"}`;
      const marker = arrows[state === "dim" ? "dim" : "idle"];
      let d;
      if (t.row === a.row && slotOf(target) === slotOf(i) + 1) {
        d = `M${a.x + NW},${a.y + NH / 2} L${t.x - 2},${t.y + NH / 2}`;
      } else if (t.row === a.row) {
        const span = Math.abs(slotOf(target) - slotOf(i));
        const lift = 16 + Math.min(4, span) * 6;
        const dir = slotOf(target) > slotOf(i) ? 1 : -1;      // leave on the side we are heading to
        const sx = a.x + NW / 2 + dir * 7, ex = t.x + NW / 2 - dir * 7;
        d = `M${sx},${a.y} C${sx},${a.y - lift} ${ex},${t.y - lift} ${ex},${t.y - 2}`;
      } else {
        d = `M${a.x + NW / 2},${a.y + NH} C${a.x + NW / 2},${a.y + NH + 24} ${t.x + NW / 2},${t.y - 24} ${t.x + NW / 2},${t.y - 2}`;
      }
      sv("path", { d, class: cls, "marker-end": marker }, svg);
    });

    // nodes
    values.forEach((value, i) => {
      const p = pos(slotOf(i));
      const state = stateOf(b, i);
      sv("rect", { x: p.x, y: p.y, width: NW, height: NH, rx: 6, class: `vz-cell vz-${state}` }, svg);
      sv("text", { x: p.x + NW / 2, y: p.y + NH / 2 + 4, "text-anchor": "middle", class: `vz-val vz-t-${state}`, "font-size": 12 }, svg, S(value, 5));
    });

    // pointer tags (staggered per row so names never overlap)
    const byRow = new Map();
    for (const g of groupPointers(pointers, "index")) {
      const p = pos(slotOf(g.key));
      const entry = { ...g, x: p.x + NW / 2, y: p.y + NH + 4 };
      byRow.set(p.row, (byRow.get(p.row) || []).concat(entry));
    }
    for (const entries of byRow.values()) {
      const rows = stagger(entries);
      entries.forEach((e, i) => tag(svg, e.x, e.y + rows[i] * 13, e.text));
    }
    return svg;
  }

  function buildLevelOrder(values) {
    if (!values.length || values[0] === null || values[0] === undefined) return null;
    const make = i => ({ i, val: values[i], l: null, r: null });
    const root = make(0);
    const queue = [root];
    let p = 1;
    while (queue.length && p < values.length) {
      const cur = queue.shift();
      for (const side of ["l", "r"]) {
        if (p >= values.length) break;
        if (values[p] !== null && values[p] !== undefined) {
          cur[side] = make(p);
          queue.push(cur[side]);
        }
        p++;
      }
    }
    return root;
  }

  function drawTree(b, heap) {
    const values = list(b.values);
    const nodes = [];
    if (heap) {
      values.forEach((v, i) => {
        if (v === null || v === undefined) return;
        const depth = Math.floor(Math.log2(i + 1));
        const slot = i + 1 - 2 ** depth;
        nodes.push({ i, val: v, depth, px: (slot + 0.5) / 2 ** depth, parent: i ? Math.floor((i - 1) / 2) : -1 });
      });
    } else {
      const root = buildLevelOrder(values);
      if (!root) return drawText({ text: "(empty tree)" });
      let counter = 0;
      const walk = (node, depth, parent) => {
        if (!node) return;
        walk(node.l, depth + 1, node.i);
        nodes.push({ i: node.i, val: node.val, depth, order: counter++, parent });
        walk(node.r, depth + 1, node.i);
      };
      // parent index must be known to children: compute after the fact
      const parentOf = new Map();
      const mark = node => { if (!node) return; for (const c of [node.l, node.r]) if (c) { parentOf.set(c.i, node.i); mark(c); } };
      mark(root);
      walk(root, 0, -1);
      nodes.forEach(nd => { nd.parent = parentOf.has(nd.i) ? parentOf.get(nd.i) : -1; });
      const span = Math.max(1, counter - 1);
      nodes.forEach(nd => { nd.px = counter === 1 ? 0.5 : nd.order / span; });
      nodes.span = counter;
    }
    if (!nodes.length) return drawText({ text: heap ? "(empty heap)" : "(empty tree)" });
    const maxDepth = Math.max(...nodes.map(nd => nd.depth));
    const count = nodes.length;
    const leafSlots = heap ? 2 ** maxDepth : (nodes.span || 1);
    const r = Math.max(8, Math.min(15, (W - 24) / Math.max(leafSlots, 2) / 2.2));
    const levelH = Math.max(34, r * 3);
    const pad = r + 8;
    const height = pad + maxDepth * levelH + r + 22;
    const { svg } = newSvg(W, height, b.label || (heap ? "heap" : "tree"));
    const place = nd => {
      const inner = W - 2 * pad;
      const x = heap ? pad + nd.px * inner : (count === 1 ? W / 2 : pad + nd.px * inner);
      return { x, y: pad + nd.depth * levelH };
    };
    const byIndex = new Map(nodes.map(nd => [nd.i, nd]));
    nodes.forEach(nd => {
      const parent = byIndex.get(nd.parent);
      if (!parent) return;
      const a = place(parent), c = place(nd);
      sv("line", { x1: a.x, y1: a.y, x2: c.x, y2: c.y, class: "vz-edge" }, svg);
    });
    const names = new Map(groupPointers(b.pointers, "index").map(g => [g.key, g.text]));
    nodes.forEach(nd => {
      const p = place(nd);
      const state = stateOf(b, nd.i);
      sv("circle", { cx: p.x, cy: p.y, r, class: `vz-cell vz-${state}` }, svg);
      sv("text", { x: p.x, y: p.y + 4, "text-anchor": "middle", class: `vz-val vz-t-${state}`, "font-size": Math.max(8, Math.min(12, r * 0.85)) }, svg, S(nd.val, 4));
      if (names.has(nd.i)) sv("text", { x: p.x, y: p.y + r + 11, "text-anchor": "middle", class: "vz-ptr-text" }, svg, names.get(nd.i));
    });
    return svg;
  }

  function drawGraph(raw) {
    // Tolerate bare ids ("A", 3) as well as {id, label} objects, and numeric ids in the state lists.
    const ids = v => list(v).map(String);
    const pairs = v => list(v).map(p => [String(p[0]), String(p[1])]);
    const nodes = list(raw.nodes).map(nd =>
      nd && typeof nd === "object"
        ? { id: String(nd.id), label: nd.label !== undefined ? nd.label : nd.id }
        : { id: String(nd), label: String(nd) });
    const b = {
      ...raw,
      highlight: ids(raw.highlight), done: ids(raw.done), dim: ids(raw.dim),
      highlight_edges: pairs(raw.highlight_edges), done_edges: pairs(raw.done_edges), dim_edges: pairs(raw.dim_edges),
      edges: list(raw.edges).map(e => ({ ...e, from: String(e.from), to: String(e.to) })),
      pointers: list(raw.pointers).map(p => ({ ...p, node: String(p.node) }))
    };
    const n = nodes.length;
    const cx = W / 2;
    const compact = n <= 2;
    const height = compact ? 120 : 250;
    const cy = compact ? 55 : 122;
    const R = 92, nr = 16;
    const { svg, arrows } = newSvg(W, height, b.label || "graph");
    const pos = new Map();
    nodes.forEach((node, i) => {
      if (n === 1) pos.set(node.id, { x: cx, y: cy });
      else if (n === 2) pos.set(node.id, { x: cx + (i ? 70 : -70), y: cy });
      else {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
        pos.set(node.id, { x: cx + R * Math.cos(angle) * 1.25, y: cy + R * Math.sin(angle) });
      }
    });
    const edgeState = (a, c) => {
      const match = set => list(set).some(p => (p[0] === a && p[1] === c) || (!b.directed && p[0] === c && p[1] === a));
      return match(b.highlight_edges) ? "active" : match(b.done_edges) ? "done" : match(b.dim_edges) ? "dim" : "idle";
    };
    const edges = list(b.edges);
    const reverse = new Set(edges.map(e => `${e.to}>${e.from}`));
    edges.forEach((e, edgeIndex) => {
      const a = pos.get(e.from), c = pos.get(e.to);
      if (!a || !c) return;
      let dx = c.x - a.x, dy = c.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const shift = b.directed && reverse.has(`${e.from}>${e.to}`) ? 6 : 0;
      const ox = -dy * shift, oy = dx * shift;
      const pad = b.directed ? nr + 3 : nr;
      const x1 = a.x + dx * nr + ox, y1 = a.y + dy * nr + oy;
      const x2 = c.x - dx * pad + ox, y2 = c.y - dy * pad + oy;
      const state = edgeState(e.from, e.to);
      const attrs = { x1, y1, x2, y2, class: `vz-edge vz-e-${state}` };
      if (b.directed) attrs["marker-end"] = arrows[state];
      sv("line", attrs, svg);
      if (e.weight !== undefined && e.weight !== "") {
        // alternate the position along the edge so crossing edges do not stack their labels
        const t = edgeIndex % 2 ? 0.36 : 0.64;
        sv("text", { x: x1 + (x2 - x1) * t - dy * 8, y: y1 + (y2 - y1) * t + dx * 8 + 3, "text-anchor": "middle", class: "vz-weight" }, svg, S(e.weight, 6));
      }
    });
    const names = new Map();
    for (const p of list(b.pointers)) names.set(p.node, (names.get(p.node) || []).concat(S(p.name, 8)));
    nodes.forEach(node => {
      const p = pos.get(node.id);
      const state = has(b.highlight, node.id) ? "active" : has(b.done, node.id) ? "done" : has(b.dim, node.id) ? "dim" : "idle";
      sv("circle", { cx: p.x, cy: p.y, r: nr, class: `vz-cell vz-${state}` }, svg);
      sv("text", { x: p.x, y: p.y + 4, "text-anchor": "middle", class: `vz-val vz-t-${state}`, "font-size": 12 }, svg, S(node.label || node.id, 5));
      let ux = p.x - cx, uy = p.y - cy;
      const ul = Math.hypot(ux, uy);
      if (n < 3 || ul < 1) { ux = 0; uy = 1; } else { ux /= ul; uy /= ul; }
      const info = b.node_info && b.node_info[node.id];
      if (info) sv("text", { x: p.x + ux * (nr + 14), y: p.y + uy * (nr + 9) + 3, "text-anchor": "middle", class: "vz-small" }, svg, S(info, 10));
      if (names.has(node.id)) {
        const far = info ? 22 : 10;
        sv("text", { x: p.x + ux * (nr + far + 6), y: p.y + uy * (nr + far) + 3, "text-anchor": "middle", class: "vz-ptr-text" }, svg, names.get(node.id).join(","));
      }
    });
    return svg;
  }

  function drawStack(b) {
    const items = list(b.items);
    const bh = 28;
    const height = Math.max(1, items.length) * (bh + 2) + 26;
    const { svg } = newSvg(W, height, b.label || "stack");
    const x = 110, w = 150;
    if (!items.length) {
      sv("rect", { x, y: 10, width: w, height: bh, rx: 4, class: "vz-null" }, svg);
      sv("text", { x: x + w / 2, y: 28, "text-anchor": "middle", class: "vz-small" }, svg, "(empty)");
      return svg;
    }
    items.forEach((value, i) => {
      const y = height - 16 - (i + 1) * (bh + 2) + 2;
      const state = stateOf(b, i);
      sv("rect", { x, y, width: w, height: bh, rx: 4, class: `vz-cell vz-${state}` }, svg);
      sv("text", { x: x + w / 2, y: y + bh / 2 + 4, "text-anchor": "middle", class: `vz-val vz-t-${state}`, "font-size": 13 }, svg, S(value, 14));
    });
    const topY = height - 16 - items.length * (bh + 2) + 2;
    sv("text", { x: x + w + 8, y: topY + bh / 2 + 4, class: "vz-ptr-text" }, svg, "← top");
    sv("line", { x1: x - 6, x2: x + w + 6, y1: height - 14, y2: height - 14, class: "vz-axis" }, svg);
    return svg;
  }

  function drawQueue(b) {
    const items = list(b.items);
    const n = Math.max(1, items.length);
    const cw = Math.min(52, Math.floor((W - 24) / n));
    const x0 = (W - cw * items.length) / 2;
    const { svg } = newSvg(W, 76, b.label || "queue");
    if (!items.length) {
      sv("rect", { x: 110, y: 10, width: 150, height: 30, rx: 4, class: "vz-null" }, svg);
      sv("text", { x: 185, y: 30, "text-anchor": "middle", class: "vz-small" }, svg, "(empty)");
      return svg;
    }
    items.forEach((value, i) => {
      const state = stateOf(b, i);
      sv("rect", { x: x0 + i * cw + 1, y: 10, width: cw - 2, height: 32, rx: 4, class: `vz-cell vz-${state}` }, svg);
      sv("text", { x: x0 + i * cw + cw / 2, y: 30, "text-anchor": "middle", class: `vz-val vz-t-${state}`, "font-size": Math.min(13, cw * 0.4) }, svg, S(value, cw < 30 ? 3 : 8));
    });
    tag(svg, x0 + cw / 2, 46, "front");
    if (items.length > 1) tag(svg, x0 + (items.length - 1) * cw + cw / 2, 46, "back");
    return svg;
  }

  function drawIntervals(b) {
    const items = list(b.items);
    const markers = list(b.markers);
    const all = items.flatMap(it => [it.start, it.end]).concat(markers.map(m => m.at));
    let lo = Math.min(...all), hi = Math.max(...all);
    if (lo === hi) { lo -= 1; hi += 1; }
    const left = 16, right = W - 16;
    const sx = v => left + ((v - lo) / (hi - lo)) * (right - left);
    const rowH = 24, top = markers.length ? 22 : 8;
    const height = top + items.length * rowH + 30;
    const { svg } = newSvg(W, height, b.label || "intervals");
    const axisY = top + items.length * rowH + 6;
    sv("line", { x1: left, x2: right, y1: axisY, y2: axisY, class: "vz-axis" }, svg);
    const ticks = hi - lo <= 20 && Number.isInteger(lo) && Number.isInteger(hi)
      ? Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
      : [lo, hi];
    ticks.forEach(t => {
      sv("line", { x1: sx(t), x2: sx(t), y1: axisY, y2: axisY + 4, class: "vz-axis" }, svg);
      sv("text", { x: sx(t), y: axisY + 14, "text-anchor": "middle", class: "vz-idx" }, svg, S(t, 6));
    });
    items.forEach((it, i) => {
      const state = stateOf(b, i);
      const x = sx(it.start), w = Math.max(6, sx(it.end) - sx(it.start));
      const y = top + i * rowH + 2;
      sv("rect", { x, y, width: w, height: rowH - 6, rx: 4, class: `vz-cell vz-${state}` }, svg);
      const label = it.label || `[${S(it.start, 4)},${S(it.end, 4)}]`;
      sv("text", { x: x + w / 2, y: y + (rowH - 6) / 2 + 3.5, "text-anchor": "middle", class: `vz-val vz-t-${state}`, "font-size": 10 }, svg, S(label, 12));
    });
    markers.forEach(m => {
      sv("line", { x1: sx(m.at), x2: sx(m.at), y1: 14, y2: axisY, class: "vz-marker" }, svg);
      sv("text", { x: sx(m.at), y: 10, "text-anchor": "middle", class: "vz-ptr-text" }, svg, S(m.name, 8));
    });
    return svg;
  }

  function drawMap(b) {
    const table = h("table", "vz-map");
    const head = h("tr", "", null, h("thead", "", null, table));
    h("th", "", S(b.key_header || "key", 12), head);
    h("th", "", S(b.value_header || "value", 12), head);
    const body = h("tbody", "", null, table);
    const entries = list(b.entries);
    if (!entries.length) {
      const row = h("tr", "", null, body);
      const cell = h("td", "vz-muted", "(empty)", row);
      cell.colSpan = 2;
    }
    entries.forEach(entry => {
      const row = h("tr", has(b.highlight, S(entry.key, 12)) ? "vz-row-active" : "", null, body);
      h("td", "", S(entry.key, 12), row);
      h("td", "", S(entry.value, 16), row);
    });
    return table;
  }

  function chips(items, block) {
    const wrap = h("div", "vz-chips");
    if (!items.length) h("span", "vz-chip vz-dim vz-muted", "(empty)", wrap);
    items.forEach((item, i) => h("span", `vz-chip vz-${stateOf(block, i)}`, S(item, 10), wrap));
    return wrap;
  }

  function drawVars(b) {
    const wrap = h("div", "vz-chips");
    list(b.items).forEach(item => {
      const chip = h("span", "vz-chip vz-var" + (item.highlight ? " vz-active" : ""), null, wrap);
      h("b", "", S(item.name, 14) + " = ", chip);
      h("span", "", S(item.value, 24), chip);
    });
    return wrap;
  }

  function drawText(b) {
    return h("p", "vz-note", S(b.text, 220));
  }

  const DRAWERS = {
    array: drawArray,
    grid: drawGrid,
    linkedlist: drawLinkedList,
    tree: b => drawTree(b, false),
    heap: b => drawTree(b, true),
    graph: drawGraph,
    stack: drawStack,
    queue: drawQueue,
    intervals: drawIntervals,
    map: drawMap,
    set: b => chips(list(b.items), b),
    vars: drawVars,
    text: drawText
  };

  function drawBlock(block) {
    const wrap = h("figure", "vz-block");
    if (block && block.label && block.type !== "text") h("figcaption", "vz-label", S(block.label, 40), wrap);
    try {
      const drawer = DRAWERS[block && block.type];
      if (!drawer) throw new Error("unknown block type");
      wrap.append(drawer(block));
    } catch (error) {
      h("p", "vz-muted", "This part of the diagram could not be drawn.", wrap);
      console.warn("CFSolutionViz: could not draw block", block && block.type, error);
    }
    return wrap;
  }

  // ----------------------------------------------------------------- player

  function mount(container, spec) {
    if (active) active.destroy();
    container.replaceChildren();

    const scenes = list(spec && spec.scenes);
    if (!scenes.length) {
      h("p", "vz-muted", "No diagram steps were returned for this problem.", container);
      return null;
    }

    const root = h("div", "vz", null, container);
    root.tabIndex = 0;

    // overview
    const head = h("div", "vz-head", null, root);
    if (spec.approach_name) h("div", "vz-approach", spec.approach_name, head);
    if (spec.summary) h("p", "vz-summary", spec.summary, head);
    if (spec.key_insight) {
      const insight = h("p", "vz-insight", null, head);
      h("b", "", "Key idea: ", insight);
      insight.append(document.createTextNode(S(spec.key_insight, 260)));
    }
    const facts = h("div", "vz-facts", null, head);
    if (spec.example && spec.example.input) {
      const fact = h("div", "", null, facts);
      h("b", "", "Example: ", fact);
      fact.append(document.createTextNode(S(spec.example.input, 200) + (spec.example.output ? "  →  " + S(spec.example.output, 120) : "")));
    }
    if (spec.complexity && (spec.complexity.time || spec.complexity.space)) {
      const fact = h("div", "", null, facts);
      h("b", "", "Cost: ", fact);
      fact.append(document.createTextNode(`${S(spec.complexity.time, 24) || "?"} time · ${S(spec.complexity.space, 24) || "?"} space`));
    }

    // controls
    const controls = h("div", "vz-controls", null, root);
    const firstBtn = h("button", "vz-btn", "⏮", controls);
    const prevBtn = h("button", "vz-btn", "◀", controls);
    const playBtn = h("button", "vz-btn vz-play", "▶ Play", controls);
    const nextBtn = h("button", "vz-btn", "▶", controls);
    const lastBtn = h("button", "vz-btn", "⏭", controls);
    for (const [button, label] of [[firstBtn, "First step"], [prevBtn, "Previous step"], [nextBtn, "Next step"], [lastBtn, "Last step"], [playBtn, "Play or pause"]]) {
      button.type = "button";
      button.setAttribute("aria-label", label);
    }
    const slider = h("input", "vz-slider", null, root);
    slider.type = "range";
    slider.min = 0;
    slider.max = scenes.length - 1;
    slider.value = 0;
    slider.setAttribute("aria-label", "Step");
    const counter = h("div", "vz-counter", "", root);

    // scene
    const stage = h("div", "vz-stage", null, root);
    const titleEl = h("div", "vz-title", "", stage);
    const captionEl = h("p", "vz-caption", "", stage);
    const blocksEl = h("div", "vz-blocks", null, stage);

    // pseudocode
    const pseudo = list(spec.pseudocode);
    let pseudoLines = [];
    if (pseudo.length) {
      const details = h("details", "vz-pseudo", null, root);
      details.open = true;
      h("summary", "", "Pseudocode", details);
      const ol = h("ol", "", null, details);
      pseudoLines = pseudo.map(line => {
        const li = h("li", "", null, ol);
        h("code", "", String(line), li);
        return li;
      });
    }

    h("p", "vz-disclaimer", "AI-generated illustration of the approach on a small example. It was not executed or verified, so check details against your own reasoning.", root);

    let index = 0;
    let timer = null;

    function go(i) {
      index = Math.max(0, Math.min(scenes.length - 1, i));
      const scene = scenes[index];
      slider.value = index;
      counter.textContent = `Step ${index + 1} of ${scenes.length}`;
      titleEl.textContent = scene.title || "";
      captionEl.textContent = scene.caption || "";
      blocksEl.replaceChildren(...list(scene.structures).map(drawBlock));
      blocksEl.classList.remove("vz-fade");
      void blocksEl.offsetWidth;
      blocksEl.classList.add("vz-fade");
      pseudoLines.forEach((li, n) => li.classList.toggle("vz-line-active", n === scene.pseudo_line));
      firstBtn.disabled = prevBtn.disabled = index === 0;
      nextBtn.disabled = lastBtn.disabled = index === scenes.length - 1;
    }

    function pause() {
      if (timer) clearInterval(timer);
      timer = null;
      playBtn.textContent = "▶ Play";
    }

    function play() {
      if (timer) return pause();
      if (index >= scenes.length - 1) go(0);
      playBtn.textContent = "⏸ Pause";
      timer = setInterval(() => {
        if (index >= scenes.length - 1) return pause();
        go(index + 1);
        if (index >= scenes.length - 1) pause();
      }, 2600);
    }

    firstBtn.addEventListener("click", () => { pause(); go(0); });
    prevBtn.addEventListener("click", () => { pause(); go(index - 1); });
    nextBtn.addEventListener("click", () => { pause(); go(index + 1); });
    lastBtn.addEventListener("click", () => { pause(); go(scenes.length - 1); });
    playBtn.addEventListener("click", play);
    slider.addEventListener("input", () => { pause(); go(Number(slider.value)); });
    root.addEventListener("keydown", event => {
      if (event.target.tagName === "INPUT") return;
      if (event.key === "ArrowRight") { pause(); go(index + 1); event.preventDefault(); }
      if (event.key === "ArrowLeft") { pause(); go(index - 1); event.preventDefault(); }
    });

    go(0);

    const controller = {
      go, play, pause,
      next: () => go(index + 1),
      prev: () => go(index - 1),
      get index() { return index; },
      destroy() { pause(); if (active === controller) active = null; }
    };
    active = controller;
    return controller;
  }

  return { mount, drawBlock };
})();
