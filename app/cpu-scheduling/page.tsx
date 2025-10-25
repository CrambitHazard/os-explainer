import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'

export default function CPUScheduling() {
  return (
    <>
      <ThemeToggle />
      <div className="module-page">
        <h1>CPU Scheduling</h1>
        <p>Coming Soon</p>
        <Link href="/" className="back-button">← Back to Home</Link>
      </div>
    </>
  )
}

