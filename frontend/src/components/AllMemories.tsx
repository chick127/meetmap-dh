"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PhotoLightbox from "@/components/PhotoLightbox";
import PhotoMap, { type PhotoPin } from "@/features/memory/PhotoMap";
import { api, ApiError } from "@/lib/api";
import { colorMap, type MemPhoto, type Memories } from "@/lib/memories";
import { formatDayHeading, kstDay } from "@/lib/photos";
import { formatMeetDate } from "@/lib/records";
import "./memories.css";

type View = "photos" | "map" | "records";
const PAGE = 90;

/**
 * 그룹에 들어가기 전 첫 화면: 내가 속한 모든 그룹의 사진 · 추억지도 · 지난 기록을 한꺼번에 보여준다.
 * 그룹마다 색이 달라서 작은 색 표시로 어느 그룹 것인지 알 수 있고,
 * 위쪽 그룹 버튼을 누르면 그 그룹 것만 골라 볼 수 있다.
 */
export default function AllMemories({ groupsHint }: { groupsHint?: number }) {
  const router = useRouter();
  const [data, setData] = useState<Memories | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("photos");
  const [only, setOnly] = useState<number | null>(null); // null = 전체 그룹
  const [shown, setShown] = useState(PAGE);
  const [pinId, setPinId] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [viewer, setViewer] = useState<{ list: MemPhoto[]; i: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<Memories>("/me/memories")
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          router.push("/login");
          return;
        }
        // 서버가 아직 새 기능을 배포하지 않았을 때도 그룹 목록 화면은 쓸 수 있게 안내만 한다
        setError(
          e instanceof ApiError && e.status === 404
            ? "전체 보기 기능이 서버에 아직 반영되지 않았어요. 서버를 새로 배포한 뒤 다시 열어 주세요."
            : "추억을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const colors = useMemo(() => colorMap(data?.groups ?? []), [data]);
  const nameOf = useMemo(() => new Map((data?.groups ?? []).map((g) => [g.id, g.name])), [data]);
  const colorOf = (gid: number) => colors.get(gid) ?? "#999";
  const keep = (gid: number) => only === null || gid === only;

  const photos = useMemo(() => (data?.photos ?? []).filter((p) => keep(p.group_id)), [data, only]); // eslint-disable-line react-hooks/exhaustive-deps
  const records = useMemo(() => (data?.records ?? []).filter((r) => keep(r.group_id)), [data, only]); // eslint-disable-line react-hooks/exhaustive-deps

  // 날짜별로 묶기 (이미 최신순)
  const days = useMemo(() => {
    const out: { day: string; items: MemPhoto[] }[] = [];
    for (const p of photos.slice(0, shown)) {
      const day = kstDay(p.created_at);
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(p);
      else out.push({ day, items: [p] });
    }
    return out;
  }, [photos, shown]);

  // 지도 핀: 같은 장소(좌표)는 그룹이 달라도 핀 하나로 합치고, 그룹별로 나눠서 보여준다
  const places = useMemo(() => {
    type Place = { key: string; name: string; address: string | null; lat: number; lng: number; photos: MemPhoto[]; byGroup: Map<number, MemPhoto[]> };
    const map = new Map<string, Place>();
    for (const p of data?.place_photos ?? []) {
      if (!keep(p.group_id) || p.place_lat == null || p.place_lng == null || !p.place_name) continue;
      const key = `${p.place_lat.toFixed(4)},${p.place_lng.toFixed(4)}`;
      let f = map.get(key);
      if (!f) {
        f = { key, name: p.place_name, address: p.place_address, lat: p.place_lat, lng: p.place_lng, photos: [], byGroup: new Map() };
        map.set(key, f);
      }
      f.photos.push(p);
      f.byGroup.set(p.group_id, [...(f.byGroup.get(p.group_id) ?? []), p]);
    }
    return Array.from(map.values());
  }, [data, only]); // eslint-disable-line react-hooks/exhaustive-deps

  const pins: PhotoPin[] = useMemo(
    () =>
      places.map((pl) => {
        const gids = Array.from(pl.byGroup.keys()).sort((a, b) => a - b);
        return {
          id: pl.key,
          name: pl.name,
          latitude: pl.lat,
          longitude: pl.lng,
          count: pl.photos.length,
          time: Date.parse(pl.photos[0].created_at) || 0,
          thumb: pl.photos.find((p) => p.signed_url)?.signed_url ?? null,
          color: colors.get(gids[0]),
          colors: gids.map((g) => colors.get(g) ?? "#999"),
        };
      }),
    [places, colors],
  );
  const picked = places.find((pl) => pl.key === pinId) ?? null;

  const tabs: { key: View; label: string; n: number }[] = [
    { key: "photos", label: "사진", n: photos.length },
    { key: "map", label: "추억지도", n: places.length },
    { key: "records", label: "지난 기록", n: records.length },
  ];

  if (error) return <div className="error">{error}</div>;
  if (!data)
    return (
      <div className="card muted" aria-busy="true">
        {groupsHint === 0 ? "" : "내 그룹의 추억을 모으는 중..."}
      </div>
    );

  const groupColor = (gid: number) => ({ "--c": colorOf(gid) }) as React.CSSProperties;

  return (
    <>
      {data.groups.length > 1 && (
        <div className="am-groups" role="group" aria-label="그룹 고르기">
          <button type="button" className={only === null ? "on" : ""} onClick={() => { setOnly(null); setShown(PAGE); setPinId(""); }}>
            전체
          </button>
          {data.groups.map((g) => (
            <button
              key={g.id}
              type="button"
              style={groupColor(g.id)}
              className={only === g.id ? "on tint" : ""}
              onClick={() => { setOnly(g.id); setShown(PAGE); setPinId(""); }}
            >
              <span className="gdot" style={groupColor(g.id)} />
              {g.name}
            </button>
          ))}
        </div>
      )}

      <nav className="mt-tabs" aria-label="추억 보기">
        {tabs.map((t) => (
          <button key={t.key} type="button" className={view === t.key ? "on" : ""} aria-pressed={view === t.key} onClick={() => setView(t.key)}>
            {t.label} {t.n}
          </button>
        ))}
      </nav>

      {view === "photos" &&
        (photos.length === 0 ? (
          <div className="card ph-empty">
            <h3>아직 사진이 없어요</h3>
            <p>그룹에 들어가 사진을 올리면 여기에 모여요.</p>
          </div>
        ) : (
          <>
            {days.map((d) => (
              <section key={d.day}>
                <h2 className="am-day">{formatDayHeading(d.day)}</h2>
                <div className="am-grid">
                  {d.items.map((p) => (
                    <Link
                      key={p.id}
                      href={`/groups/${p.group_id}/photos/${p.id}`}
                      className={`am-tile${p.signed_url ? "" : " noimg"}${data.groups.length > 1 ? " tinted" : ""}`}
                      style={groupColor(p.group_id)}
                      aria-label={`${nameOf.get(p.group_id) ?? "그룹"} 사진`}
                    >
                      {p.signed_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.signed_url} alt="" loading="lazy" decoding="async" />
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
            {photos.length > shown && (
              <button type="button" className="btn secondary am-more" onClick={() => setShown((n) => n + PAGE)}>
                사진 더 보기
              </button>
            )}
          </>
        ))}

      {view === "map" && (
        <div className="am-map">
          <div>
          <button type="button" className="btn secondary sm am-reset" onClick={() => { setPinId(""); setResetKey((k) => k + 1); }}>
            ← 전체 지도로
          </button>
          <div className="mm-mapbox">
            <PhotoMap pins={pins} selectedPinId={pinId} onPinClick={(p) => setPinId(p.id)} height="520px" resetKey={resetKey} />
            {places.length === 0 && (
              <div className="mm-empty">
                <h3>아직 장소가 있는 사진이 없어요</h3>
                <p>사진을 올릴 때 장소를 지정하면 지도에 모여요.</p>
              </div>
            )}
          </div>
          </div>
          <aside className="am-map-side">
            {picked ? (
              <section className="card">
                <h2 className="card-title">{picked.name}</h2>
                <p className="meta">{picked.address ?? ""} · 사진 {picked.photos.length}장{picked.byGroup.size > 1 ? ` · 그룹 ${picked.byGroup.size}개` : ""}</p>
                {Array.from(picked.byGroup.entries()).map(([gid, list]) => (
                  <div key={gid} className="am-pin-group" style={groupColor(gid)}>
                    <span className="am-gchip">
                      <span className="gdot" style={groupColor(gid)} />
                      {nameOf.get(gid)} · {list.length}장
                    </span>
                    <div className="am-pin-photos">
                      {list.map((p, i) => (
                        <button key={p.id} type="button" onClick={() => setViewer({ list, i })} aria-label="사진 크게 보기">
                          {p.signed_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.signed_url} alt="" loading="lazy" decoding="async" />
                          )}
                        </button>
                      ))}
                    </div>
                    <Link className="btn secondary block" href={`/groups/${gid}/map?view=memory`}>
                      {nameOf.get(gid)} 추억지도에서 보기
                    </Link>
                  </div>
                ))}
              </section>
            ) : (
              <section className="card">
                <h2 className="card-title" style={{ marginBottom: 6 }}>장소를 눌러 보세요</h2>
                <p className="muted">
                  테두리 색이 그룹을 나타내요. 사진을 누르면 그 장소의 사진이 여기에 나와요.
                </p>
              </section>
            )}
          </aside>
        </div>
      )}

      {view === "records" &&
        (records.length === 0 ? (
          <div className="card ph-empty">
            <h3>아직 지난 기록이 없어요</h3>
            <p>그룹에서 약속이 확정되고 날짜가 지나면 기록이 자동으로 생겨요.</p>
          </div>
        ) : (
          <div className="am-rec">
            {records.map((r) => (
              <Link key={`${r.group_id}-${r.id}`} href={`/groups/${r.group_id}/records/${r.id}`} style={groupColor(r.group_id)}>
                <div className="am-rec-cover">
                  {r.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover_url} alt="" loading="lazy" decoding="async" />
                  ) : (
                    "사진 없음"
                  )}
                </div>
                <div className="am-rec-body">
                  <span className="am-gchip" style={groupColor(r.group_id)}>
                    <span className="gdot" style={groupColor(r.group_id)} />
                    {nameOf.get(r.group_id)}
                  </span>
                  <strong>{r.title}</strong>
                  <span className="meta">
                    {formatMeetDate(r.meet_date)} · 📍 {r.place_name ?? "장소 미정"}
                    {r.photo_count > 0 ? ` · 사진 ${r.photo_count}장` : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ))}

      {viewer && (
        <PhotoLightbox
          photos={viewer.list.map((p) => ({ id: p.id, url: p.signed_url, href: `/groups/${p.group_id}/photos/${p.id}` }))}
          index={viewer.i}
          onIndex={(i) => setViewer({ ...viewer, i })}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
