import Constants from 'expo-constants';

const REPO = 'JavaSqr/thoughts';

// Read current version from app.json so we only update it in one place.
const CURRENT = Constants.expoConfig?.version || '1.0.0';

// Compare semver strings, returns true if `a` is newer than `b`.
function isNewer(a, b) {
  const pa = a.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return false;
}

// Check GitHub Releases for a newer published APK.
// Returns { version, url, notes } if an update is available, otherwise null.
export async function checkForUpdate() {
  if (REPO.startsWith('your_username')) return null; // not configured yet
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const latest = data.tag_name;
    if (!latest || !isNewer(latest, CURRENT)) return null;
    const apk = (data.assets || []).find((a) => a.name.endsWith('.apk'));
    return {
      version: latest,
      url: apk?.browser_download_url || data.html_url,
      notes: (data.body || '').trim(),
    };
  } catch (e) {
    return null;
  }
}
