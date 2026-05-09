import { ArrowRight, Brain, Shield, Zap, CheckCircle, Star, Users, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export default function WelcomePage({ onNavigate, onOpenAuth }: Props) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(20,184,166,0.15)_0%,_transparent_60%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-teal-300 text-sm font-medium">Welcome to the Future of Learning</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
              Knowledge is the New <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Global Currency
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Stop paying for courses. Start exchanging skills. Mind2Mind connects experts for genuine knowledge sharing. Teach what you love, learn what you need.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={() => onOpenAuth('signup')} className="group w-full sm:w-auto">
                Join Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span>Video-Verified Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-teal-400" />
                <span>Peer-Reviewed Quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How Mind2Mind Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">A seamless loop of teaching and learning designed for real-world impact.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(() => {
              const colorMap = {
                teal: { bg: 'bg-teal-500/10', text: 'text-teal-600' },
                cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-600' },
                indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600' }
              };

              return [
                {
                  icon: Brain,
                  title: 'List Your Skills',
                  desc: 'Create a profile showcasing what you can teach and what you want to learn. Verified by community feedback.',
                  color: 'teal' as const
                },
                {
                  icon: Users,
                  title: 'Find Your Match',
                  desc: 'Our smart recommendation engine finds experts who want exactly what you have to offer.',
                  color: 'cyan' as const
                },
                {
                  icon: MessageSquare,
                  title: 'Start Exchanging',
                  desc: 'Connect via real-time messages and video calls. One hour of your time for one hour of theirs.',
                  color: 'indigo' as const
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow group">
                  <div className={`w-14 h-14 ${colorMap[feature.color].bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${colorMap[feature.color].text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
              Ready to Expand Your Mind?
            </h2>
            <p className="text-teal-50 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Join thousands of experts trading knowledge globally. Your first exchange is just one click away.
            </p>
            
            <div className="relative z-10">
              <Button size="xl" onClick={() => onOpenAuth('signup')} className="bg-white text-teal-600 hover:bg-teal-50 border-white shadow-xl">
                Get Started for Free
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
