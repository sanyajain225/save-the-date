import { createFileRoute } from "@tanstack/react-router";
import { ScratchHeart } from "@/components/ScratchHeart";
import { Sparkles } from "@/components/Sparkles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Swati & Harsh — Save the Date · 12.08.2027" },
      {
        name: "description",
        content:
          "An invitation to celebrate the wedding of Swati & Harsh on 12 August 2027.",
      },
      { property: "og:title", content: "Swati & Harsh — Save the Date" },
      {
        property: "og:description",
        content: "Celebrate with us on 12.08.2027.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const calendarUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent("Swati & Harsh — Wedding") +
    "&dates=20270812T030000Z/20270812T150000Z" +
    "&details=" +
    encodeURIComponent("With great joy, we invite you to celebrate our wedding.") +
    "&location=" +
    encodeURIComponent("To be announced");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Sparkles count={50} />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          zIndex: 0,
        }}
      />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-between px-6 py-12 text-center sm:py-16">
        <header className="animate-fade-up">
          <p
            className="gold-text mb-3 tracking-[0.55em]"
            style={{ fontSize: "clamp(10px, 2vw, 12px)" }}
          >
            ✦ WITH BLESSINGS ✦
          </p>
          <h1
            className="gold-text font-light leading-[0.95]"
            style={{
              fontSize: "clamp(48px, 11vw, 96px)",
              fontStyle: "italic",
              letterSpacing: "0.01em",
            }}
          >
            Save the Date
          </h1>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-[#d4a64a] to-transparent" />
        </header>

        <div className="my-10 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <ScratchHeart />
        </div>

        <footer
          className="flex w-full flex-col items-center gap-5 animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          <h2
            className="gold-text font-medium"
            style={{
              fontSize: "clamp(34px, 8vw, 64px)",
              letterSpacing: "0.08em",
            }}
          >
            SWATI &amp; HARSH
          </h2>
          <p
            className="tracking-[0.5em] text-[#f5d99a]/90"
            style={{ fontSize: "clamp(12px, 2.6vw, 16px)" }}
          >
            12 • 08 • 2027
          </p>

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-3 rounded-full border border-[rgba(247,226,155,0.55)] bg-[rgba(0,0,0,0.22)] px-7 py-3 text-[12px] tracking-[0.38em] text-[#f7e29b] backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:bg-[rgba(247,226,155,0.12)] hover:shadow-[0_10px_40px_rgba(247,226,155,0.25)]"
          >
            <span className="text-[#f7e29b]">✦</span>
            ADD TO CALENDAR
            <span className="text-[#f7e29b]">✦</span>
          </a>

          <p
            className="mt-6 italic text-[#f5d99a]/60"
            style={{ fontSize: "clamp(11px, 2.2vw, 13px)", letterSpacing: "0.12em" }}
          >
            Together with their families
          </p>
        </footer>
      </section>
    </main>
  );
}
