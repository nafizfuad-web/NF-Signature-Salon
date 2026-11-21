import Icon from '@/components/common/Icon'

// NF Signature Salon — Client reviews section
// Shows sample review cards for design preview. The section is explicitly
// labelled so the cards are never presented as verified client feedback.

const SAMPLE_REVIEWS = [
  {
    id: 'r1',
    name: 'Sara M.',
    service: 'Hair colouring',
    rating: 5,
    review:
      'The consultation was thorough and the colour came out exactly as we discussed. I left feeling like myself again.',
  },
  {
    id: 'r2',
    name: 'Priya K.',
    service: 'Facial',
    rating: 5,
    review:
      'Calm, unhurried and genuinely attentive. My skin felt comfortable for days afterwards and the advice was practical.',
  },
  {
    id: 'r3',
    name: 'Nadia H.',
    service: 'Bridal makeup',
    rating: 5,
    review:
      'They took the time to understand my outfit and preferences. The finished look lasted all evening without feeling heavy.',
  },
]

export default function ClientReviews() {
  return (
    <section
      className="section-padding client-reviews-section"
      aria-labelledby="client-reviews-title"
    >
      <div className="section-container">
        <div className="client-reviews-heading">
          <p className="client-reviews-eyebrow">From our community</p>
          <h2 id="client-reviews-title">Client Reviews</h2>
          <p className="client-reviews-intro">
            A glimpse of the experience our clients describe. New verified reviews will appear here
            once the review service is connected.
          </p>
        </div>

        <div className="client-reviews-grid">
          {SAMPLE_REVIEWS.map((review) => (
            <article key={review.id} className="client-review-card">
              <div
                className="client-review-stars"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon
                    key={index}
                    name="star"
                    size={15}
                    className={index < review.rating ? 'client-review-star is-filled' : 'client-review-star'}
                  />
                ))}
              </div>
              <blockquote className="client-review-quote">{review.review}</blockquote>
              <footer className="client-review-author">
                <strong>{review.name}</strong>
                <span>{review.service}</span>
              </footer>
            </article>
          ))}
        </div>

        <p className="client-reviews-note">
          <Icon name="info" size={14} />
          Sample reviews are shown for design preview only. Replace them with verified client
          feedback before launch.
        </p>
      </div>
    </section>
  )
}
