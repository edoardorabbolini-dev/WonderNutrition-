function wondy(mood){const h=mood=="happy";
return `<svg viewBox="0 0 200 230" aria-label="Wondy, il labrador dottore">
<ellipse cx="100" cy="222" rx="55" ry="6" fill="#000" opacity=".12"/>
<path d="M52 150h96l10 68H42z" fill="#fff" stroke="#d8e3da" stroke-width="3"/>
<path d="M88 150l12 30 12-30z" fill="#1ab4d6"/><path d="M100 188v30" stroke="#d8e3da" stroke-width="3"/>
<path d="M70 158q-8 30 25 38" fill="none" stroke="#7c9cf2" stroke-width="5" stroke-linecap="round"/><circle cx="96" cy="197" r="8" fill="#7c9cf2"/><circle cx="96" cy="197" r="3.5" fill="#fff"/>
<rect x="124" y="170" width="20" height="18" rx="3" fill="#d9f3f8"/><path d="M134 174v10M129 179h10" stroke="#1ab4d6" stroke-width="3"/>
<ellipse cx="46" cy="88" rx="22" ry="42" fill="#1f1f23" transform="rotate(14 46 88)"/><ellipse cx="154" cy="88" rx="22" ry="42" fill="#1f1f23" transform="rotate(-14 154 88)"/>
<circle cx="100" cy="88" r="60" fill="#2b2b30"/>
<ellipse cx="100" cy="112" rx="34" ry="26" fill="#3d3d44"/>
<g class="blink" style="transform-origin:100px 82px;animation:bl 4s infinite"><circle cx="76" cy="82" r="10" fill="#fff"/><circle cx="124" cy="82" r="10" fill="#fff"/>
<circle cx="78" cy="84" r="6" fill="#111"/><circle cx="126" cy="84" r="6" fill="#111"/><circle cx="80" cy="81" r="2" fill="#fff"/><circle cx="128" cy="81" r="2" fill="#fff"/></g>
<path d="M62 64q14-9 26-2M112 62q12-7 26 2" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="100" cy="103" rx="13" ry="9" fill="#0d0d0f"/><ellipse cx="96" cy="100" rx="4" ry="2" fill="#fff" opacity=".5"/>
<path d="M100 112v6M86 120q14 ${h?14:8} 28 0" fill="none" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>
${h?'<path d="M92 124q8 22 16 0z" fill="#ff7b8a"/>':''}
<style>@keyframes bl{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}</style></svg>`}
