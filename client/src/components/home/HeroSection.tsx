import { useEffect, useRef, useState, type TouchEvent } from 'react'
import BookingSearch from '@/components/home/BookingSearch'

const slides = [
  { src: '/services/hair-styling.jpg', alt: 'Professional salon hair styling' },
  { src: '/services/womens-haircut.jpg', alt: 'A client enjoying a salon haircut' },
  { src: '/services/skin-care.jpg', alt: 'A relaxing premium skincare treatment' },
  { src: '/services/head-massage.jpg', alt: 'A calming head massage in the salon' },
  { src: '/services/bridal-makeup.jpg', alt: 'Elegant professional bridal makeup' },
]

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(preference.matches)
    preference.addEventListener('change', updatePreference)
    return () => preference.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (paused || reducedMotion) return
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion])

  const showSlide = (nextIndex: number) => {
    setActiveSlide((nextIndex + slides.length) % slides.length)
  }

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return
    const delta = event.changedTouches[0]?.clientX
    if (delta === undefined) return
    const distance = delta - touchStartX.current
    if (Math.abs(distance) > 48) showSlide(activeSlide + (distance < 0 ? 1 : -1))
    touchStartX.current = null
  }

  return (
    <section
      className="home-hero"
      aria-label="NF Signature Salon"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="home-hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            className={`home-hero-slide${index === activeSlide ? ' is-active' : ''}`}
            src={slide.src}
            alt={slide.alt}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        ))}
      </div>
      <div className="home-hero-overlay" aria-hidden="true" />

      <div className="home-hero-content">
        <p className="home-hero-eyebrow">Premium beauty &amp; wellness</p>
        <h1>
          Where <em>Elegance</em> Meets Expertise
        </h1>
        <p className="home-hero-intro">
          Find your next salon experience in the heart of Dhaka.
        </p>
        <BookingSearch />
      </div>

      <div className="home-hero-controls" aria-label="Banner image controls">
        <button type="button" aria-label="Previous image" onClick={() => showSlide(activeSlide - 1)}>
          <span aria-hidden="true">‹</span>
        </button>
        <div className="home-hero-indicators" role="group" aria-label="Choose banner image">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show image ${index + 1} of ${slides.length}`}
              aria-current={index === activeSlide ? 'true' : undefined}
              className={index === activeSlide ? 'is-active' : ''}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>
        <button type="button" aria-label="Next image" onClick={() => showSlide(activeSlide + 1)}>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  )
}
