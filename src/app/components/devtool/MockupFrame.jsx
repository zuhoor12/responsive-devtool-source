import LiveFrame from "@/components/devtool/LiveFrame";

// Renders the live site preview inside the transparent photo frame of the
// selected device. The mockup PNG is anchored so its screen hole lines up
// exactly with the site viewport (non-uniform scaling keeps the preview at the
// device's true CSS viewport dimensions).
export default function MockupFrame({ mockup, device, width, height, zoom, darkMode }) {
  const scale = zoom / 100;
  const isDesktop = device.category === "desktop";
  // Landscape phones/tablets: the portrait frame PNG is rotated onto the
  // landscape viewport, but the site itself renders unrotated (landscape).
  const rotated = !isDesktop && width > height;
  const radius = device.category === "mobile" ? 40 : device.category === "tablet" ? 10 : 2;

  let frame;
  let hitStyle;
  if (!rotated) {
    const fx = width / mockup.s.w;
    const fy = height / mockup.s.h;
    hitStyle = { left: -mockup.s.x * fx, top: -mockup.s.y * fy, width: mockup.pngW * fx, height: mockup.pngH * fy };
    frame = (
      <img
        src={mockup.src}
        alt={`${device.name} device frame`}
        draggable={false}
        className="absolute pointer-events-none select-none z-10"
        style={{
          left: -mockup.s.x * fx,
          top: -mockup.s.y * fy,
          width: mockup.pngW * fx,
          height: mockup.pngH * fy,
          maxWidth: "none",
          filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.35))",
        }}
      />
    );
  } else {
    // Rotated frame: the PNG's internal x-axis maps to page height and its
    // y-axis to page width, so each axis is scaled independently and the
    // rotation origin math places the screen hole exactly on the viewport.
    const kx = width / mockup.s.h; // vertical PNG scale -> page width
    const ky = height / mockup.s.w; // horizontal PNG scale -> page height
    hitStyle = {
      left: (mockup.s.y + mockup.s.h) * kx, top: -mockup.s.x * ky, width: mockup.pngW * ky, height: mockup.pngH * kx,
      transform: "rotate(90deg)", transformOrigin: "0 0",
    };
    frame = (
      <img
        src={mockup.src}
        alt={`${device.name} device frame`}
        draggable={false}
        className="absolute pointer-events-none select-none z-10"
        style={{
          left: (mockup.s.y + mockup.s.h) * kx,
          top: -mockup.s.x * ky,
          width: mockup.pngW * ky,
          height: mockup.pngH * kx,
          transform: "rotate(90deg)",
          transformOrigin: "0 0",
          maxWidth: "none",
          filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.35))",
        }}
      />
    );
  }

  return (
    <div style={{ width: width * scale, height: height * scale }} className="relative">
      <div
        style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
        className="absolute top-0 left-0"
      >
        {/* Transparent grab area over the bezel: the live <iframe> swallows pointer events on the
            screen, so the device is dragged by its frame (the screen stays fully interactive). */}
        <div aria-hidden="true" className="absolute" style={{ ...hitStyle, maxWidth: "none" }} />
        <div data-rdt-screen={device.id} style={{ width, height, borderRadius: radius, overflow: "hidden" }} className="relative bg-card">
          <LiveFrame device={device} width={width} height={height} darkMode={darkMode} />
        </div>
        {frame}
      </div>
    </div>
  );
}