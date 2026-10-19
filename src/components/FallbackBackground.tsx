/**
 * Pure-CSS atmospheric fallback (spec §18 / §19).
 *
 * Rendered instead of the WebGL canvas when WebGL is unavailable or fails, so
 * the visitor always gets a polished, readable experience — never a blank page.
 */
export function FallbackBackground() {
  return (
    <div className="fallback-bg" aria-hidden="true">
      <div className="fallback-bg__glow fallback-bg__glow--a" />
      <div className="fallback-bg__glow fallback-bg__glow--b" />
      <div className="fallback-bg__glow fallback-bg__glow--c" />
      <div className="fallback-bg__grain" />
    </div>
  );
}
