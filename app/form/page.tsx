"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Helper: inject a <script> tag and await it ─────────────────────── */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

export default function FormPage() {
  /* true  = show white overlay (loading)
     false = overlay gone, user sees the page */
  const [overlayVisible, setOverlayVisible] = useState(true);
  const done = useRef(false);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    let observer: MutationObserver | null = null;

    /* Remove the overlay once MediaAlpha has painted content */
    function revealPage() {
      if (observer) { observer.disconnect(); observer = null; }
      timers.forEach(clearTimeout);
      setOverlayVisible(false);
    }

    /* Watch #mediaalpha_placeholder for injected children */
    function watchForContent() {
      const el = document.getElementById("mediaalpha_placeholder");
      if (!el) { timers.push(setTimeout(revealPage, 500)); return; }
      if (el.childElementCount > 0) { revealPage(); return; }

      observer = new MutationObserver(() => {
        if (el.childElementCount > 0) revealPage();
      });
      observer.observe(el, { childList: true, subtree: true });

      /* Hard fallback: reveal after 6 s even if widget never arrives */
      timers.push(setTimeout(revealPage, 6000));
    }

    /* Configure MediaAlpha and call its loader */
    function callMediaAlpha(txId: string, oid: string, affid: string) {
      (window as any).MediaAlphaExchange = {
        data: { zip: "90210" },
        placement_id: "cP7PfxOaxlKLnxfttKkome6HKPCKMg",
        sub_1: oid || "test sub id",
        sub_2: affid || "test sub id",
        sub_3: txId || "test sub id",
        type: "ad_unit",
        version: 17,
      };
      const fn = (window as any).MediaAlphaExchange__load;
      if (typeof fn === "function") {
        fn("mediaalpha_placeholder");
        watchForContent();
      } else {
        revealPage(); /* MediaAlpha serve.js failed to load */
      }
    }

    /* Run EF.click() then call MediaAlpha */
    function runEF() {
      if (done.current) return;
      done.current = true;

      const EF = (window as any).EF;

      /* Redirect scenario – all params already in URL */
      const urlTxId = EF.urlParameter("_ef_transaction_id");
      const urlOid = EF.urlParameter("ef_oid");
      const urlAffid = EF.urlParameter("ef_aid");
      if (urlTxId && urlOid && urlAffid) {
        callMediaAlpha(urlTxId, urlOid, urlAffid);
        return;
      }

      /* Direct-link scenario */
      const clickParams = {
        offer_id: EF.urlParameter("oid"),
        affiliate_id: EF.urlParameter("affid"),
      };

      /* Safeguard: if EF.click() never resolves within 3 s */
      const efFallback = setTimeout(() => callMediaAlpha("", "", ""), 3000);
      timers.push(efFallback);

      try {
        const result = EF.click(clickParams);
        if (result && typeof result.then === "function") {
          result
            .then((r: any) => {
              clearTimeout(efFallback);
              callMediaAlpha(
                r?.transaction_id || "",
                r?.offer_id || clickParams.offer_id || "",
                r?.affiliate_id || clickParams.affiliate_id || ""
              );
            })
            .catch(() => { clearTimeout(efFallback); callMediaAlpha("", "", ""); });
        } else {
          clearTimeout(efFallback);
          callMediaAlpha(
            result?.transaction_id || result || "",
            result?.offer_id || clickParams.offer_id || "",
            result?.affiliate_id || clickParams.affiliate_id || ""
          );
        }
      } catch {
        clearTimeout(efFallback);
        callMediaAlpha("", "", "");
      }
    }

    /* Load both scripts, then run logic */
    async function init() {
      // Check if scripts are already globally loaded (from root layout)
      const isEfReady = !!(window as any).EF;
      const isMaReady = typeof (window as any).MediaAlphaExchange__load === "function";

      if (!isEfReady || !isMaReady) {
        try {
          // If not ready (e.g. direct hit to page or slow connection), load them now
          await Promise.all([
            loadScript("https://www.ro3vq6tf.com/scripts/main.js"),
            loadScript("//insurance.mediaalpha.com/js/serve.js"),
          ]);
        } catch {
          /* One or both scripts failed — try to run logic as best effort */
        }
      }

      if (!(window as any).EF) {
        /* EF completely unavailable → show widget with empty subs */
        callMediaAlpha("", "", "");
        return;
      }

      runEF();
    }

    init();

    /* Absolute max wait — if everything hangs, reveal the page */
    timers.push(setTimeout(revealPage, 8000));

    return () => {
      timers.forEach(clearTimeout);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* ── Branded loading screen ────────────────────────────────── */}
      {overlayVisible && (
        <div
          role="status"
          aria-label="Loading your quote"
          style={{
            position: "fixed",
            inset: 0,
            background: "#ffffff",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
          }}
        >
          {/* Logo */}
          <img
            src="/images/logo1.svg"
            alt="CoveragePrincipal"
            style={{ width: 200, maxWidth: "60vw" }}
          />

          {/* Spinner */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "4px solid #e5e7eb",
              borderTopColor: "#2563eb",
              animation: "pw-spin 0.8s linear infinite",
            }}
          />

          {/* Message */}
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "1rem",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.01em",
            }}
          >
            Loading your quote…
          </p>

          {/* Keyframe injected inline via a style tag */}
          <style>{`@keyframes pw-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Full page — always in DOM so MediaAlpha has a target div ─ */}
      <div id="___gatsby">
        <div style={{ outline: "none" }} tabIndex={-1} id="gatsby-focus-wrapper">

          {/* Header */}
          <header className="LogoLinksButton--header--TPR5X LogoLinksButton--dark--oyZ+4 undefined">
            <div className="row">
              <div className="col-8 col-sm-auto">
                <a className="LogoLinksButton--logo--VCaLy" aria-label="Go Home" href="/">
                  <img className="logoContainer" src="/images/logo1.svg" loading="eager" alt="CoveragePrincipal" />
                </a>
              </div>
              <div className="col d-none d-lg-flex LogoLinksButton--links--wYaiL">
                <button
                  type="button"
                  className="QuaternaryButton--quaternary--tvu5L GlobalButton--button--JDCYo Button--button--Iuhfg Button--small--R40YS"
                >
                  <svg width={23} height={23} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(0deg)" }}>
                    <path d="M14.0499 5C15.0267 5.19057 15.9243 5.66826 16.628 6.37194C17.3317 7.07561 17.8094 7.97326 17.9999 8.95M14.0499 1C16.0792 1.22544 17.9715 2.13417 19.4162 3.57701C20.8608 5.01984 21.7719 6.91101 21.9999 8.94M20.9999 16.92V19.92C21.0011 20.1985 20.944 20.4742 20.8324 20.7293C20.7209 20.9845 20.5572 21.2136 20.352 21.4019C20.1468 21.5901 19.9045 21.7335 19.6407 21.8227C19.3769 21.9119 19.0973 21.9451 18.8199 21.92C15.7428 21.5856 12.7869 20.5341 10.1899 18.85C7.77376 17.3147 5.72527 15.2662 4.18993 12.85C2.49991 10.2412 1.44818 7.27099 1.11993 4.18C1.09494 3.90347 1.12781 3.62476 1.21643 3.36162C1.30506 3.09849 1.4475 2.85669 1.6347 2.65162C1.82189 2.44655 2.04974 2.28271 2.30372 2.17052C2.55771 2.05833 2.83227 2.00026 3.10993 2H6.10993C6.59524 1.99522 7.06572 2.16708 7.43369 2.48353C7.80166 2.79999 8.04201 3.23945 8.10993 3.72C8.23656 4.68007 8.47138 5.62273 8.80993 6.53C8.94448 6.88792 8.9736 7.27691 8.89384 7.65088C8.81408 8.02485 8.6288 8.36811 8.35993 8.64L7.08993 9.91C8.51349 12.4135 10.5864 14.4864 13.0899 15.91L14.3599 14.64C14.6318 14.3711 14.9751 14.1858 15.3491 14.1061C15.723 14.0263 16.112 14.0555 16.4699 14.19C17.3772 14.5286 18.3199 14.7634 19.2799 14.89C19.7657 14.9585 20.2093 15.2032 20.5265 15.5775C20.8436 15.9518 21.0121 16.4296 20.9999 16.92Z"
                      stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>(877) 512-3977</span>
                </button>
              </div>
              <div className="col d-lg-none d-flex justify-content-end">
                <svg width={50} height={50} className="toggleButton LogoLinksButton--toggleButton--GSi0g" viewBox="0 0 50 50">
                  <g fill="none" fillRule="evenodd">
                    <path d="M0 0h50v50H0z" />
                    <g fillRule="nonzero" fill="#333">
                      <path d="M10.5 26h29a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-29a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5zM10.5 35h29a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-29a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5zM10.5 17h29a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-29a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5z" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </header>

          {/* Main — MediaAlpha injects into this div */}
          <main>
            <div data-isloading="false">
              <div id="mediaalpha_placeholder" />
            </div>
          </main>

          {/* Footer */}
          <footer className="Footer--footer--QGO+1">
            <div className="container">
              <div className="Footer--links--jmW2m">
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
                <a href="/sms" target="_blank" rel="noopener noreferrer">SMS Terms</a>
                <a href="/ccpa" target="_blank" rel="noopener noreferrer">CCPA</a>
                <a href="/disclaimer" target="_blank" rel="noopener noreferrer">Disclaimer</a>
                <a href="/unsubscribe" target="_blank" rel="noopener noreferrer">Unsubscribe</a>
              </div>
              <div className="Footer--disclaimer--lR02g">
                <p>
                  CoveragePrincipal.com is an online insurance referral site. We match and directly connect consumers with
                  insurance companies and agents across the US. Our site does not provide quotes directly to consumers
                  and is not in any way affiliated with any of the insurance carriers. We do not provide insurance and
                  we do not represent any specific insurance provider or automobile company. All trademarks and
                  copyrights are the property of their respective owners. All articles on this website are for
                  information purposes only. This website contains affiliate marketing links and phone numbers which
                  means that the operators of this site may get paid commission on sales of the products or services
                  advertised.
                </p>
              </div>
              <p className="Footer--copyright--L955O">© 2026. All rights reserved.</p>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
