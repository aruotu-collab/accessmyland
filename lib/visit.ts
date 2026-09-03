export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    ""
  );
}

export function countryName(code: string) {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function geoFromHeaders(request: Request) {
  const countryCode = request.headers.get("x-vercel-ip-country") ?? "";
  return {
    countryCode,
    country: countryName(countryCode),
    region: decodeURIComponent(request.headers.get("x-vercel-ip-country-region") ?? ""),
    city: decodeURIComponent(request.headers.get("x-vercel-ip-city") ?? ""),
    latitude: request.headers.get("x-vercel-ip-latitude") ?? "",
    longitude: request.headers.get("x-vercel-ip-longitude") ?? "",
  };
}

export function parseUserAgent(ua: string) {
  const device = /iPad|Tablet/i.test(ua)
    ? "Tablet"
    : /Mobi|Android/i.test(ua)
      ? "Mobile"
      : "Desktop";
  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  return { device, browser };
}

export function isPrivateIp(ip: string) {
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("::ffff:127.")) {
    return true;
  }
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  const match = /^172\.(\d+)\./.exec(ip);
  if (match) {
    const octet = Number(match[1]);
    return octet >= 16 && octet <= 31;
  }
  return false;
}

export function requestPlace(request: Request) {
  const ip = clientIp(request) || "127.0.0.1";
  const geo = geoFromHeaders(request);
  const local = isPrivateIp(ip);
  return {
    ip,
    country: geo.country || (local ? "Local" : ""),
    countryCode: geo.countryCode,
    region: geo.region,
    city: geo.city,
    latitude: geo.latitude,
    longitude: geo.longitude,
  };
}

export function displayLocation(visit: {
  city?: string;
  region?: string;
  country?: string;
  ip?: string;
}) {
  const parts = [visit.city, visit.region, visit.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (visit.ip && isPrivateIp(visit.ip)) return "Local network";
  return "Unknown location";
}
