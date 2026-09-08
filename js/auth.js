/**
 * LANDSLIDE SENTINEL AI - Authentication, RBAC & Security Matrix
 */

const ROLES = {
  ADMIN: {
    name: 'State Administrator (SEOC / SSDMA)',
    badge: 'bg-danger',
    permissions: ['VIEW_RISK', 'SUBMIT_REPORT', 'VERIFY_REPORT', 'AUTHORIZE_DISPATCH', 'MODIFY_THRESHOLDS', 'DEPLOY_MODEL', 'VIEW_AUDIT_LOGS']
  },
  DISASTER_AUTHORITY: {
    name: 'Disaster Incident Commander (SDRF)',
    badge: 'bg-warning text-dark',
    permissions: ['VIEW_RISK', 'SUBMIT_REPORT', 'VERIFY_REPORT', 'AUTHORIZE_DISPATCH', 'VIEW_RESOURCES']
  },
  FIELD_OFFICER: {
    name: 'Assistant Engineer / Field Geologist (PWD)',
    badge: 'bg-info text-dark',
    permissions: ['VIEW_RISK', 'SUBMIT_REPORT', 'VERIFY_REPORT', 'UPLOAD_PHOTOS']
  },
  ROAD_AUTHORITY: {
    name: 'NHIDCL Highway Patrol Officer',
    badge: 'bg-primary',
    permissions: ['VIEW_RISK', 'SUBMIT_REPORT', 'UPDATE_ROAD_STATUS']
  },
  CITIZEN: {
    name: 'Citizen / Highway Traveler',
    badge: 'bg-secondary',
    permissions: ['VIEW_RISK', 'SUBMIT_REPORT', 'VIEW_SHELTERS', 'RECEIVE_ALERTS']
  }
};

let currentUser = {
  username: 'officer_tashi',
  name: 'Tashi Bhutia',
  role: 'FIELD_OFFICER'
};

let auditLogs = [
  { timestamp: '2026-09-08T04:30:00Z', user: 'system', action: 'ML_INFERENCE_PIPELINE_RUN', details: 'HistGB Platt Calibrated Model v1.0 executed successfully' },
  { timestamp: '2026-09-08T04:30:00Z', user: 'system', action: 'TELEMETRY_INGESTION', details: 'NASA IMERG 30-min telemetry synced' },
  { timestamp: '2026-09-07T15:30:00Z', user: 'engineer_singtam', action: 'FIELD_REPORT_VERIFICATION', details: 'Report FLD-2026-001 verified on site' }
];

export function initAuth() {
  renderUserBadge();
}

export function getCurrentUser() {
  return currentUser;
}

export function switchRole(roleKey) {
  if (ROLES[roleKey]) {
    currentUser.role = roleKey;
    currentUser.name = roleKey === 'ADMIN' ? 'State Relief Commissioner' : (roleKey === 'CITIZEN' ? 'Public User' : 'Officer Karma');
    renderUserBadge();
    logAction('ROLE_SWITCH', `User switched role to ${roleKey}`);
  }
}

export function hasPermission(permissionKey) {
  const roleConfig = ROLES[currentUser.role];
  return roleConfig ? roleConfig.permissions.includes(permissionKey) : false;
}

export function logAction(action, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    user: currentUser.username,
    action,
    details
  };
  auditLogs.unshift(entry);
}

export function getAuditLogs() {
  return auditLogs;
}

function renderUserBadge() {
  const badgeEl = document.getElementById('user-role-badge');
  if (badgeEl) {
    const roleConfig = ROLES[currentUser.role] || ROLES.CITIZEN;
    badgeEl.innerHTML = `
      <span class="badge ${roleConfig.badge}">${roleConfig.name}</span>
    `;
  }
}

/**
 * File Upload Security Sanitizer
 * Validates mime-types, file size limits (< 10MB), and extension safety against path traversal
 */
export function validateUploadFile(file) {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Security Violation: Only JPEG, PNG, or WebP images are allowed' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'Security Violation: File size exceeds 10MB limit' };
  }
  // Sanitize filename against directory traversal
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return { valid: true, sanitizedName: cleanName };
}
