import {SiteHeader} from '@/components/layout/site-header';
import {MobileBottomNav} from '@/components/layout/mobile-bottom-nav';
import { HeroSection } from '@/components/home/hero';
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/ar");
}