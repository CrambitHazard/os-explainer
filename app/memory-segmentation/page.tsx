import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'

export default function MemorySegmentation() {
  return (
    <>
      <ThemeToggle />
      <div className="module-page">
        <h1>Memory Management (Segmentation)</h1>
        <p>Coming Soon</p>
        <Link href="/" className="back-button">← Back to Home</Link>
      </div>
    </>
  )
}

