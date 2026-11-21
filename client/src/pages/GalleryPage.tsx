import { useEffect, useRef, useState, type MouseEvent } from 'react'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import type { GalleryImage } from '@/types'

const galleryImages: GalleryImage[] = [
  {
    id: 'salon-interior',
    src: '/services/hair-highlights.jpg',
    alt: 'Interior view of salon styling stations and chairs',
    category: 'Salon Interior',
  },
  {
    id: 'haircut',
    src: '/services/hair-coloring.jpg',
    alt: 'A stylist finishing a client’s short haircut with a blow-dryer',
    category: 'Haircut',
  },
  {
    id: 'hair-styling',
    src: '/services/hair-styling.jpg',
    alt: 'Long glossy hair styled in loose waves',
    category: 'Hair Styling',
  },
  {
    id: 'beard-grooming',
    src: '/services/beard-styling.jpg',
    alt: 'Barber refining a short haircut and beard line with a razor',
    category: 'Beard Grooming',
  },
  {
    id: 'facial-skincare',
    src: '/services/skin-care.jpg',
    alt: 'Close-up beauty portrait with a luminous complexion',
    category: 'Facial & Skincare',
  },
  {
    id: 'hair-treatment',
    src: '/services/hair-treatment.jpg',
    alt: 'Natural curls with healthy texture and volume',
    category: 'Hair Treatment',
  },
  {
    id: 'nail-care',
    src: '/services/manicure.jpg',
    alt: 'Hand with polished nails and nail art',
    category: 'Manicure & Pedicure',
  },
  {
    id: 'beauty-services',
    src: '/services/bridal-makeup.jpg',
    alt: 'A makeup artist applying lipstick for an occasion look',
    category: 'Beauty Services',
  },
]

export default function GalleryPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [fallbackImages, setFallbackImages] = useState<Record<string, boolean>>({})
  const closeButton = useRef<HTMLButtonElement>(null)
  const activeTrigger = useRef<HTMLButtonElement | null>(null)
  const activeImage = activeIndex === null ? null : galleryImages[activeIndex]

  useEffect(() => {
    if (activeIndex === null) {
      activeTrigger.current?.focus()
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowRight') {
        setActiveIndex((index) => (index === null ? null : (index + 1) % galleryImages.length))
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((index) =>
          index === null ? null : (index - 1 + galleryImages.length) % galleryImages.length
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex])

  function closeLightbox() {
    setActiveIndex(null)
  }

  function stopOverlayClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation()
  }

  function imageSource(image: GalleryImage): string {
    return fallbackImages[image.id] ? '/services/fallback.svg' : image.src
  }

  function handleImageError(image: GalleryImage) {
    setFallbackImages((current) => ({ ...current, [image.id]: true }))
    setLoadedImages((current) => ({ ...current, [image.id]: true }))
  }

  return (
    <>
      <PageHeader
        eyebrow="A look inside NF Signature Salon"
        title="Our Gallery"
        subtitle="Explore salon spaces, styling, grooming, skincare, nail care and beauty work."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Gallery' }]}
      />

      <section className="section-padding gallery-page" aria-label="Salon photo gallery">
        <div className="section-container">
          <div className="salon-gallery-grid">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                ref={(element) => {
                  if (activeIndex === index) activeTrigger.current = element
                }}
                className={`salon-gallery-card${loadedImages[image.id] ? ' is-loaded' : ' is-loading'}`}
                type="button"
                aria-label={`Expand ${image.category} image`}
                onClick={(event) => {
                  activeTrigger.current = event.currentTarget
                  setActiveIndex(index)
                }}
              >
                <span className="salon-gallery-image-frame">
                  <img
                    src={imageSource(image)}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoadedImages((current) => ({ ...current, [image.id]: true }))}
                    onError={() => handleImageError(image)}
                  />
                </span>
                <span className="salon-gallery-caption">
                  <span>{image.category}</span>
                  <Icon name="plus" size={18} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeImage && activeIndex !== null && (
        <div className="gallery-lightbox" role="presentation" onClick={closeLightbox}>
          <div
            className="gallery-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeImage.category} photo`}
            onClick={stopOverlayClick}
          >
            <button
              ref={closeButton}
              className="gallery-lightbox-close"
              type="button"
              aria-label="Close image"
              onClick={closeLightbox}
            >
              <Icon name="x" size={22} />
            </button>
            <button
              className="gallery-lightbox-nav gallery-lightbox-prev"
              type="button"
              aria-label="Previous image"
              onClick={() => setActiveIndex((activeIndex - 1 + galleryImages.length) % galleryImages.length)}
            >
              <Icon name="arrow-left" size={22} />
            </button>
            <figure>
              <img
                src={imageSource(activeImage)}
                alt={activeImage.alt}
                onError={() => handleImageError(activeImage)}
              />
              <figcaption>{activeImage.category}</figcaption>
            </figure>
            <button
              className="gallery-lightbox-nav gallery-lightbox-next"
              type="button"
              aria-label="Next image"
              onClick={() => setActiveIndex((activeIndex + 1) % galleryImages.length)}
            >
              <Icon name="arrow-right" size={22} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
