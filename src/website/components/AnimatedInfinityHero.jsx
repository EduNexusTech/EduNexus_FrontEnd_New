export default function AnimatedInfinityHero() {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center py-8 lg:py-0">
      <div className="landing-glass w-full max-w-md rounded-3xl px-6 py-8 sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <img
          src="/edunexus-infinity-logo.png"
          alt="EduNexus — Learn, Grow, Connect, Excel"
          className="w-full"
          draggable={false}
        />
        <p className="mt-6 text-center text-xs font-extrabold uppercase tracking-[0.28em] landing-text-muted sm:text-sm">
          Learn · Grow · Connect · Excel
        </p>
      </div>
    </div>
  )
}
