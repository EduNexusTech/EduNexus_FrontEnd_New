export default function AnimatedInfinityHero() {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center py-8 lg:py-0">
      <div className="w-full max-w-md px-4 sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <img
          src="/edunexus-infinity-logo.png"
          alt="EduNexus — Learn, Grow, Connect, Excel"
          className="w-full"
          draggable={false}
        />
        <p className="mt-6 text-center text-xs font-extrabold uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
          Learn · Grow · Connect · Excel
        </p>
      </div>
    </div>
  )
}
