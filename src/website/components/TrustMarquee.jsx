import { TRUST_ITEMS } from '../content'

export default function TrustMarquee() {
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS]

  return (
    <section className="w-full overflow-hidden bg-white py-10">
      <p className="landing-wrap mb-8 text-center text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
        Full LMS + institutional platform
      </p>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
        <div className="landing-marquee gap-6">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="mx-2 inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-slate-200/90 bg-slate-50 px-7 py-3 text-sm font-extrabold text-slate-700 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-violet-500" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
