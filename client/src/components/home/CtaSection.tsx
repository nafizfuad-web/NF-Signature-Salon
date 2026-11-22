import ButtonLink from '@/components/common/ButtonLink'
import Icon from '@/components/common/Icon'

export default function CtaSection() {
  return (
    <section className="cta-section" aria-label="Book an appointment">
      <div className="section-container">
        <div className="cta-inner">
          <span className="cta-eyebrow">
            <Icon name="sparkles" size={15} />
            Your signature moment
          </span>
          <h2>Ready to feel like your best self?</h2>
          <p>
            Tell us what you have in mind. Our team will help you choose the right
            treatment and find a time that fits your day.
          </p>
          <div className="cta-actions">
            <ButtonLink to="/booking" variant="primary" rightIcon={<Icon name="arrow-right" size={16} />}>
              Book an appointment
            </ButtonLink>
            <ButtonLink to="/services" variant="outline">
              Explore the menu
            </ButtonLink>
          </div>
          <span className="cta-note">
            <Icon name="shield" size={14} />
            TEST payment demos are available after confirmation.
          </span>
        </div>
      </div>
    </section>
  )
}
