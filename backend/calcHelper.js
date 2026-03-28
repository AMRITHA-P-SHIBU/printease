const BW_RATE        = 1.5;
const COLOR_RATE     = 5;
const BINDING_COST   = 50;

function parseColorPages(input, totalPages) {
  const pages = new Set();
  if (!input || !input.trim()) return pages;
  const parts = input.split(",");
  for (let part of parts) {
    part = part.trim();
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) pages.add(i);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num) && num >= 1 && num <= totalPages) pages.add(num);
    }
  }
  return pages;
}

function calculateAmount({ printType, totalPages, colorPageInput, copies, spiralBinding, mode }) {
  // Use auto-detected totalPages as source of truth
  const tp = Math.max(1, Number(totalPages) || 1);
  const cp = Math.max(1, Number(copies) || 1);

  let total = 0;

  if (printType === "Black & White") {
    // Always black & white regardless of page numbers input
    total = BW_RATE * tp * cp;
  } else {
    // Color printing
    if (!colorPageInput || !colorPageInput.trim()) {
      // Empty page numbers field = all pages are color by default
      total = COLOR_RATE * tp * cp;
    } else {
      // Parse specified color pages and calculate mixed cost
      const colorPages = parseColorPages(colorPageInput, tp);
      const colorCount = colorPages.size;
      const bwCount = Math.max(0, tp - colorCount);
      total = ((colorCount * COLOR_RATE) + (bwCount * BW_RATE)) * cp;
    }
  }

  // ₹50 per copy for spiral binding
  if (spiralBinding === true || spiralBinding === "true" || spiralBinding === 1) {
    total += BINDING_COST * cp;
  }

  // ₹5 per page for fast track
  if (mode === "Fast Track") {
    total += 5 * tp * cp;
  }

  return Math.round(total * 100) / 100;
}

module.exports = { calculateAmount, parseColorPages };