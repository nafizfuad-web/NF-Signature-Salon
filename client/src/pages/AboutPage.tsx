import ButtonLink from '@/components/common/ButtonLink'
import Icon from '@/components/common/Icon'
import OpeningHours from '@/components/common/OpeningHours'
import PageHeader from '@/components/common/PageHeader'
import CtaSection from '@/components/home/CtaSection'
import { SALON_LOCATION } from '@/services/salonConfig'

const values = [
  {
    icon: 'scissors' as const,
    title: 'Precision',
    copy: 'Every cut, colour and treatment is planned around your features, hair and routine.',
  },
  {
    icon: 'droplet' as const,
    title: 'Care',
    copy: 'We use considered products and gentle techniques to protect your skin and hair.',
  },
  {
    icon: 'heart' as const,
    title: 'Calm',
    copy: 'A quiet, unhurried space where the appointment is as enjoyable as the result.',
  },
  {
    icon: 'shield' as const,
    title: 'Trust',
    copy: 'Clear pricing, honest advice and no pressure to add services you do not need.',
  },
]

const expectations = [
  {
    step: '01',
    title: 'Consultation first',
    copy: 'We start by listening — your goals, your routine and anything you want to avoid.',
  },
  {
    step: '02',
    title: 'A plan you can follow',
    copy: 'You leave knowing what was done, how to care for it at home and when to return.',
  },
  {
    step: '03',
    title: 'Comfort throughout',
    copy: 'Unhurried appointments, a calm setting and a team that checks in as we work.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="About NF Signature Salon"
        subtitle="A premium beauty and wellness salon built on precision, calm and genuine care."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      <section className="section-padding about-page" aria-label="Our story">
        <div className="section-container about-story">
          <div className="about-story-visual" aria-hidden="true">
            <img src="/services/hair-styling.jpg" alt="" loading="lazy" decoding="async" />
            <span className="about-story-frame" />
          </div>

          <div className="about-story-copy">
            <p className="about-eyebrow">The NF Signature approach</p>
            <h2>Beauty that feels considered, not rushed.</h2>
            <p>
              NF Signature Salon was created for people who want more than a quick appointment. We
              believe the best results come from a proper consultation, skilled hands and a calm
              room — so every visit is designed to feel personal from the first hello.
            </p>
            <p>
              Our menu brings hair, skin, nails and wellness together in one place, so you can
              build a routine that fits your life instead of chasing trends. Whether you are
              preparing for an occasion or simply keeping up with your own care, we take the time
              to get the details right.
            </p>
            <div className="about-story-actions">
              <ButtonLink to="/services" variant="primary" rightIcon={<Icon name="arrow-right" size={16} />}>
                Explore our services
              </ButtonLink>
              <ButtonLink to="/contact" variant="outline">
                Contact the salon
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding about-values-section" aria-labelledby="about-values-title">
        <div className="section-container">
          <div className="about-section-heading">
            <p className="about-eyebrow">What guides us</p>
            <h2 id="about-values-title">Our values</h2>
          </div>

          <div className="about-values">
            {values.map((value) => (
              <article key={value.title} className="about-value-card">
                <span className="about-value-icon" aria-hidden="true">
                  <Icon name={value.icon} size={20} />
                </span>
                <h3>{value.title}</h3>
                <p>{value.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding about-expect-section" aria-labelledby="about-expect-title">
        <div className="section-container">
          <div className="about-section-heading">
            <p className="about-eyebrow">What to expect</p>
            <h2 id="about-expect-title">Your first visit</h2>
          </div>

          <ol className="about-expect">
            {expectations.map((item) => (
              <li key={item.step} className="about-expect-item">
                <span className="about-expect-step" aria-hidden="true">
                  {item.step}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-padding about-visit-section" aria-labelledby="about-visit-title">
        <div className="section-container about-visit-layout">
          <div>
            <p className="about-eyebrow">Visit us</p>
            <h2 id="about-visit-title">Opening hours</h2>
            <OpeningHours />
            <p className="about-visit-note">
              {SALON_LOCATION.address
                ? `Find us at ${SALON_LOCATION.displayAddress}.`
                : 'Our confirmed street address and directions will be published soon.'}
            </p>
          </div>

          <div className="about-visit-card">
            <Icon name="map-pin" size={26} />
            <h3>{SALON_LOCATION.name}</h3>
            <p>
              {SALON_LOCATION.address
                ? SALON_LOCATION.displayAddress
                : `${SALON_LOCATION.city}. The exact business address is being finalised.`}
            </p>
            <ButtonLink to="/contact" variant="outline" fullWidth>
              Get in touch
            </ButtonLink>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
