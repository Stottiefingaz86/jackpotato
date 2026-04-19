import type { Widget } from "@/lib/types";

const DEFAULT_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jackpotato.app";

export function htmlSnippet(widget: Widget, origin = DEFAULT_ORIGIN) {
  return [
    `<!-- Jackpotato widget: ${widget.name} -->`,
    `<div data-jackpot-widget="${widget.id}"></div>`,
    `<script async src="${origin}/widget-loader.js"`,
    `        data-api-key="pk_live_••••••••"></script>`,
  ].join("\n");
}

export function iframeSnippet(widget: Widget, origin = DEFAULT_ORIGIN) {
  return [
    `<iframe`,
    `  src="${origin}/embed/${widget.id}"`,
    `  style="border:0;width:100%;height:${iframeHeight(widget)}px"`,
    `  title="${widget.name}"`,
    `  allow="autoplay"></iframe>`,
  ].join("\n");
}

export function reactSnippet(widget: Widget) {
  const Comp = reactComponentName(widget);
  return [
    `import { ${Comp} } from "@jackpotato/react";`,
    ``,
    `export function MyJackpot() {`,
    `  return (`,
    `    <${Comp}`,
    `      apiKey={process.env.NEXT_PUBLIC_JP_KEY!}`,
    `      widgetId="${widget.id}"`,
    `    />`,
    `  );`,
    `}`,
  ].join("\n");
}

export function apiSnippet(widget: Widget, origin = DEFAULT_ORIGIN) {
  return [
    `// Poll the public display API (or use SSE at /api/stream/jackpots)`,
    `const res = await fetch(`,
    `  "${origin}/api/public/widgets/${widget.id}",`,
    `  { headers: { "X-API-Key": "pk_live_••••" } }`,
    `);`,
    `const { campaign, tiers, theme } = await res.json();`,
  ].join("\n");
}

function reactComponentName(widget: Widget) {
  switch (widget.type) {
    case "sticky":
      return "StickyJackpot";
    case "hero":
      return "HeroJackpot";
    case "must_drop_meter":
      return "MustDropMeter";
    case "winner_ticker":
      return "WinnerTicker";
    case "game_badge":
      return "GameCardBadge";
  }
}

function iframeHeight(widget: Widget) {
  switch (widget.type) {
    case "hero":
      return 420;
    case "must_drop_meter":
      return 220;
    case "winner_ticker":
      return 80;
    case "game_badge":
      return 120;
    default:
      return 140;
  }
}
