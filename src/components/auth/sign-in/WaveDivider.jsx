export default function WaveDivider() {
  return (
    <div className="spacer-wave-wrap" aria-hidden>
      <svg
        className="h-full w-full"
        viewBox="0 0 72 600"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,0 C28,0 44,36 0,72 C-28,108 44,144 0,180 C28,216 44,252 0,288 C-28,324 44,360 0,396 C28,432 44,468 0,504 C-28,540 44,576 0,600 L72,600 L72,0 Z"
          fill="#5a9cf0"
          opacity="0.55"
        />
        <path
          d="M0,0 C22,0 36,36 0,72 C-22,108 36,144 0,180 C22,216 36,252 0,288 C-22,324 36,360 0,396 C22,432 36,468 0,504 C-22,540 36,576 0,600 L72,600 L72,0 Z"
          fill="#428ee8"
          opacity="0.75"
        />
        <path
          d="M0,0 C18,0 30,36 0,72 C-18,108 30,144 0,180 C18,216 30,252 0,288 C-18,324 30,360 0,396 C18,432 30,468 0,504 C-18,540 30,576 0,600 L72,600 L72,0 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  )
}
