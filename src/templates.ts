// No-code HTML starters for people who don't write HTML. Merge tags included.
export const HTML_STARTERS: { name: string; html: string; text: string }[] = [
  {
    name: "Simple personal",
    text: `Hi {{first_name|there}},\n\nI came across {{company|your company}} and had a quick idea I think is worth 90 seconds of your time.\n\nShort video here: https://youtu.be/your-video\n\nWorth a look?\n\n— Your Name`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.6">
  <p>Hi {{first_name|there}},</p>
  <p>I came across <strong>{{company|your company}}</strong> and had a quick idea I think is worth 90 seconds of your time.</p>
  <p><a href="https://youtu.be/your-video">Watch the 90-second demo →</a></p>
  <p>Worth a look?</p>
  <p>— Your Name</p>
</div>`,
  },
  {
    name: "Button CTA",
    text: `Hi {{first_name|there}},\n\nWe help companies like {{company|yours}} hit the inbox on cold outreach.\n\nSee how it works: https://youtu.be/your-video\n\n— Your Name`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222">
  <p style="font-size:15px;line-height:1.6">Hi {{first_name|there}},</p>
  <p style="font-size:15px;line-height:1.6">We help companies like <strong>{{company|yours}}</strong> land cold outreach in the inbox instead of spam.</p>
  <p style="text-align:center;margin:28px 0">
    <a href="https://youtu.be/your-video" style="background:#5b8def;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Watch the 90-second demo</a>
  </p>
  <p style="font-size:15px;line-height:1.6">— Your Name</p>
</div>`,
  },
  {
    name: "Header + card",
    text: `Hi {{first_name|there}},\n\nQuick idea for {{company|your team}}. 90-second video: https://youtu.be/your-video\n\n— Your Name`,
    html: `<div style="font-family:Arial,sans-serif;background:#f4f6fb;padding:24px">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e9ef">
    <div style="background:#5b8def;color:#fff;padding:18px 24px;font-size:18px;font-weight:700">Envelock</div>
    <div style="padding:24px;color:#222;font-size:15px;line-height:1.6">
      <p>Hi {{first_name|there}},</p>
      <p>Quick idea for <strong>{{company|your team}}</strong> — it takes 90 seconds to see.</p>
      <p><a href="https://youtu.be/your-video">Watch the demo →</a></p>
      <p>— Your Name</p>
    </div>
  </div>
</div>`,
  },
];
