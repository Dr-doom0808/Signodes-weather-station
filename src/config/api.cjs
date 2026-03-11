/**
 * API Configuration (CommonJS)
 * This file is used by Netlify Functions which require CommonJS modules.
 */

function getUVRisk(uvIndex) {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

// Falling back to your Google Script ID
const SCRIPT_ID = 'AKfycbyeMnSOQEI0F8PVGrcVe94R0xB1KrGpxQCPA_rZcYLGopLi9bO7jP3N_Vp4maozPeN8WQ'; 

module.exports = {
  getUVRisk,
  SCRIPT_ID
};