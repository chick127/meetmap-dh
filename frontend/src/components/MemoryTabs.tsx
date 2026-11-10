"use client";

import Link from "next/link";
import "./memories.css";

type Tab = "photos" | "map" | "records";

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/**
 * 그룹 안 "추억" 메뉴의 맨 위 (제목 + 사진 / 추억지도 / 지난 기록 탭).
 * 사진 · 추억지도 · 지난 기록 화면이 모두 이 머리말을 같이 쓴다.
 */
export default function MemoryTabs({
  groupId,
  current,
  sub,
  action,
}: {
  groupId: string | number;
  current: Tab;
  sub?: string;
  action?: React.ReactNode;
}) {
  const base = `/groups/${groupId}`;
  const tabs: { key: Tab; label: string; href: string; icon: React.ReactNode }[] = [
    {
      key: "photos",
      label: "사진",
      href: `${base}/photos`,
      icon: (
        <svg {...ICON_PROPS}>
          <path d="M4 5h16v14H4zM8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4 17l5-5 4 4 3-3 4 4" />
        </svg>
      ),
    },
    {
      key: "map",
      label: "추억지도",
      href: `${base}/map?view=memory`,
      icon: (
        <svg {...ICON_PROPS}>
          <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      ),
    },
    {
      key: "records",
      label: "지난 기록",
      href: `${base}/records`,
      icon: (
        <svg {...ICON_PROPS}>
          <path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4" />
        </svg>
      ),
    },
  ];
  return (
    <>
      <div className="mt-head">
        <div>
          <p className="eyebrow">함께 남긴 순간</p>
          <h1 className="page-title">추억</h1>
          {sub && <p className="page-sub">{sub}</p>}
        </div>
        {action}
      </div>
      <nav className="mt-tabs" aria-label="추억 보기">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href} className={t.key === current ? "on" : ""} aria-current={t.key === current ? "page" : undefined}>
            {t.icon}
            {t.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
