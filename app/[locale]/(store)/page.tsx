import {Container} from '@/components/layout/container';
import {SiteHeader} from '@/components/layout/site-header';
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { HeroSection } from "@/components/home/hero";
import { GenderSections } from '@/components/home/gender-section';
import { LatestProducts } from '@/components/home/latest-products';
import { SiteFooter } from "@/components/layout/site-footer";

export default async function HomePage() {

  return (
    <>
      <SiteHeader />

      <main className="pb-20 lg:pb-0 bg-white">
        <section className="min-h-[calc(100vh-80px)]">
          <Container className="flex min-h-10 items-center py-2">
            <div className="max-w-3xl">
              <HeroSection />
              <GenderSections />
              <LatestProducts />
              <SiteFooter />
            </div>
          </Container>
        </section>
      </main>

      <MobileBottomNav />
    </>
  );
}