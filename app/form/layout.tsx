/**
 * Form-specific layout.
 * Adds early resource hints so the browser starts connecting to
 * external script hosts (Everflow + MediaAlpha) before any JS runs.
 * These <link> tags are server-rendered and hoisted to <head> by Next.js.
 */
import Script from "next/script";

export default function FormLayout({ children }) {
  return (
    <>
      {/* Preconnect stays */}
      <link rel="preconnect" href="https://www.ro3vq6tf.com" />
      <link rel="preconnect" href="https://insurance.mediaalpha.com" />

      {/* 🔥 Load BEFORE React */}
      <Script
        src="https://www.ro3vq6tf.com/scripts/main.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://insurance.mediaalpha.com/js/serve.js"
        strategy="beforeInteractive"
      />

      {children}
    </>
  );
}
