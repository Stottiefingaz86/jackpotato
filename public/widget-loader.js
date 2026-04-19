/**
 * TurboPot Widget Loader
 * --------------------------------------------
 * Drop this on any page to render a configured jackpot widget:
 *
 *   <div data-jackpot-widget="wdg_123"></div>
 *   <script async src="https://turbopot.app/widget-loader.js"
 *           data-api-key="pk_live_••••"></script>
 *
 * Internally it mounts an iframe to /embed/<widgetId> so the widget is
 * fully sandboxed and theme-scoped. The loader also opens an SSE
 * connection and fans out real-time amounts to any DOM elements
 * tagged with [data-jackpot-tier="<tierId>"] for headless integrations.
 */
(function () {
  if (window.__jpLoader) return;
  window.__jpLoader = true;

  var script = document.currentScript;
  var origin = "";
  try {
    origin = new URL(script.src).origin;
  } catch (e) {
    origin = window.location.origin;
  }
  var apiKey = (script && script.getAttribute("data-api-key")) || "";

  function heightFor(type) {
    switch (type) {
      case "hero":
        return 420;
      case "must_drop_meter":
        return 220;
      case "winner_ticker":
        return 80;
      case "game_badge":
        return 120;
      case "sticky":
      default:
        return 160;
    }
  }

  function mountIframe(host, widgetId, meta) {
    var existing = host.querySelector("iframe[data-jp-embed]");
    if (existing) return;
    var iframe = document.createElement("iframe");
    iframe.setAttribute("data-jp-embed", widgetId);
    iframe.src = origin + "/embed/" + widgetId;
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.display = "block";
    iframe.style.background = "transparent";
    iframe.allow = "autoplay";
    iframe.title = (meta && meta.widget && meta.widget.name) || "Jackpot widget";
    iframe.style.height = heightFor(meta && meta.widget && meta.widget.type) + "px";
    iframe.loading = "lazy";
    host.appendChild(iframe);
  }

  function fetchWidgetMeta(widgetId) {
    return fetch(origin + "/api/public/widgets/" + widgetId, {
      headers: apiKey ? { "X-API-Key": apiKey } : {},
    })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .catch(function () {
        return null;
      });
  }

  function formatMoney(n, currency, locale) {
    try {
      return new Intl.NumberFormat(locale || "en-EU", {
        style: "currency",
        currency: currency || "EUR",
        maximumFractionDigits: 2,
      }).format(n);
    } catch (e) {
      return (currency || "EUR") + " " + (n || 0).toFixed(2);
    }
  }

  /** Fan out realtime amounts to headless DOM consumers. */
  function openStream() {
    if (window.__jpStreamOpen) return;
    window.__jpStreamOpen = true;
    var url = origin + "/api/stream/jackpots";
    var es = new EventSource(url);
    es.onmessage = function (ev) {
      try {
        var e = JSON.parse(ev.data);
        if (e.type === "jackpot.updated") {
          document
            .querySelectorAll('[data-jackpot-tier="' + e.tierId + '"]')
            .forEach(function (el) {
              var curr = el.getAttribute("data-currency") || "EUR";
              var locale = el.getAttribute("data-locale") || "en-EU";
              el.textContent = formatMoney(e.currentAmount, curr, locale);
              el.setAttribute("data-amount", e.currentAmount);
              el.classList.add("jp-flash");
              setTimeout(function () {
                el.classList.remove("jp-flash");
              }, 600);
            });
        } else if (e.type === "jackpot.won") {
          window.dispatchEvent(
            new CustomEvent("jackpot:won", { detail: e })
          );
        }
      } catch (err) {}
    };
  }

  function init() {
    var hosts = document.querySelectorAll("[data-jackpot-widget]");
    if (!hosts.length) return;
    openStream();

    hosts.forEach(function (host) {
      var widgetId = host.getAttribute("data-jackpot-widget");
      if (!widgetId) return;
      fetchWidgetMeta(widgetId).then(function (meta) {
        mountIframe(host, widgetId, meta || {});
      });
    });

    /* minimal style injection for the flash effect */
    var s = document.createElement("style");
    s.textContent =
      ".jp-flash{transition:color .2s, text-shadow .2s;color:#a855f7;text-shadow:0 0 14px rgba(168,85,247,.6)}";
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
