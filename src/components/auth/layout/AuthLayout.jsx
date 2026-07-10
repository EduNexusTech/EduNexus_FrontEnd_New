import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { AuthBackgroundFade } from './AuthBackground'

export default function AuthLayout({ hero, children }) {
  return (
    <AuthBackgroundFade>
      <div className="auth-login-inner relative flex flex-col lg:flex-row">
        <Link
          to="/"
          className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/90 px-4 py-2 text-sm font-semibold text-[#6B7280] shadow-sm backdrop-blur-sm transition hover:border-blue-200 hover:text-[#2563EB] lg:hidden"
        >
          <FiArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <section className="auth-login-hero relative hidden lg:flex lg:w-[55%] flex-col justify-center auth-hero-gradient px-10 xl:px-14 2xl:px-16">
          {hero}
        </section>

        <section className="auth-login-form-panel px-5 py-4 sm:px-8 lg:w-[45%]">
          <div className="auth-login-card-wrap">{children}</div>
        </section>
      </div>
    </AuthBackgroundFade>
  )
}
