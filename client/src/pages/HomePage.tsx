import HeroSection from '@/components/home/HeroSection'
import ServiceCategories from '@/components/home/ServiceCategories'
import FeaturedServices from '@/components/home/FeaturedServices'
import ClientReviews from '@/components/home/ClientReviews'
import SalonLocation from '@/components/home/SalonLocation'
import SalonFaq from '@/components/home/SalonFaq'
import CtaSection from '@/components/home/CtaSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServiceCategories />
      <FeaturedServices />
      <ClientReviews />
      <SalonLocation />
      <SalonFaq />
      <CtaSection />
    </>
  )
}
