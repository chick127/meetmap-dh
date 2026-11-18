// 사진 파일에 들어 있는 위치(EXIF GPS)를 읽는 도우미
// - 폰 카메라로 찍은 사진에는 찍은 곳의 위도·경도가 파일 안에 들어 있어요.
// - 스크린샷, 카톡·인스타로 받은 사진, 위치 태그를 끈 사진, 폰이 위치를 지우고 넘긴 사진에는 없어요 → null
// - 사진을 줄이기(shrinkImage) 전에 원본 파일로 읽어야 해요. 줄이면 위치 정보가 지워져요.

export type Gps = { lat: number; lng: number };

/** 사진 파일에서 위치를 읽어요. 위치가 없거나 읽을 수 없으면 null */
export async function readPhotoGps(file: File): Promise<Gps | null> {
  try {
    const exifr = (await import("exifr")).default;
    const g = await exifr.gps(file);
    if (!g || typeof g.latitude !== "number" || typeof g.longitude !== "number") return null;
    if (!Number.isFinite(g.latitude) || !Number.isFinite(g.longitude)) return null;
    if (g.latitude === 0 && g.longitude === 0) return null; // 위치를 못 잡았을 때 들어가는 값
    return { lat: g.latitude, lng: g.longitude };
  } catch {
    return null;
  }
}

/** 지금 폰의 위치 (앱의 "카메라로 찍기"에서 찍는 순간의 위치로 써요). 권한이 없거나 안 잡히면 null */
export function getCurrentGps(timeoutMs = 10000): Promise<Gps | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 },
    );
  });
}

/** 두 지점 사이 거리(미터) */
export function distanceMeters(a: Gps, b: Gps): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

// 앱의 "카메라로 찍기"로 찍은 사진은 찍을 때의 폰 위치를 파일에 연결해 둬요.
// (파일에 위치가 안 들어 있는 폰이 있어서, 사진을 보내는 쪽에서 파일 위치가 없을 때 이 값을 대신 써요)
const cameraGps = new WeakMap<File, Promise<Gps | null>>();
export function markCameraPhoto(file: File, gps: Promise<Gps | null>) {
  cameraGps.set(file, gps);
}
export function cameraGpsOf(file: File): Promise<Gps | null> | null {
  return cameraGps.get(file) ?? null;
}
