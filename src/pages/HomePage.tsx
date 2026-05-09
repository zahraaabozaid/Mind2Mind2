import HeroSection from '../components/home/HeroSection';
import HowItWorks from '../components/home/HowItWorks';
import SkillCategories from '../components/home/SkillCategories';
import FeaturedDemos from '../components/home/FeaturedDemos';
import FeaturedExperts from '../components/home/FeaturedExperts';
import CTASection from '../components/home/CTASection';
import TrendingIdeas from '../components/home/TrendingIdeas';
import BlogPreview from '../components/home/BlogPreview';
import { Page } from '../types';

interface Props {
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export default function HomePage({ onNavigate, onOpenAuth }: Props) {
  return (
    <>
      <HeroSection onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
      <HowItWorks />
      <SkillCategories onNavigate={onNavigate} />
      <FeaturedDemos onNavigate={onNavigate} />

      <TrendingIdeas onNavigate={onNavigate} />
      <FeaturedExperts onNavigate={onNavigate} />
      <BlogPreview onNavigate={onNavigate} />
      <CTASection onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </>
  );
}
