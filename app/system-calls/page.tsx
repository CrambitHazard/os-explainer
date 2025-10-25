import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'

export default function SystemCalls() {
  return (
    <>
      <ThemeToggle />
      <div className="module-page">
        <h1>System Calls & OS Services</h1>
        <p>Coming Soon</p>
        <Link href="/" className="back-button">← Back to Home</Link>
      </div>
    </>
  )
}

