import OpeningHours from '@/components/common/OpeningHours'
import { SALON_LOCATION } from '@/services/salonConfig'

export default function SalonFaq() {
  return (
    <section className="section-padding salon-faq-section" aria-labelledby="salon-faq-title">
      <div className="section-container salon-faq-container">
        <div className="salon-faq-heading">
          <p className="salon-faq-eyebrow">Helpful details</p>
          <h2 id="salon-faq-title">Frequently Asked Questions</h2>
        </div>
        <div className="salon-faq-list">
          <details>
            <summary>Where is NF Signature Salon located?</summary>
            <p>
              {SALON_LOCATION.address
                ? SALON_LOCATION.displayAddress
                : `${SALON_LOCATION.city} is the current development location. The exact business address will be published after it is configured.`}
            </p>
          </details>
          <details>
            <summary>Are appointments provided at the salon?</summary>
            <p>Yes. NF Signature Salon is a single-location, at-salon business.</p>
          </details>
          <details>
            <summary>What are the salon opening hours?</summary>
            <OpeningHours />
          </details>
          <details>
            <summary>How can I check appointment availability?</summary>
            <p>
              Select a service and date in the booking search. Available times can only be
              shown once the salon&apos;s live availability service is connected.
            </p>
          </details>
        </div>
      </div>
    </section>
  )
}
