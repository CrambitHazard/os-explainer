import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'

export default function Deadlock() {
  return (
    <>
      <ThemeToggle />
      <div className="module-page">
        <h1>Deadlock Detection & Avoidance</h1>
        <p>Coming Soon</p>
        <Link href="/" className="back-button">← Back to Home</Link>
      </div>
    </>
  )
}

