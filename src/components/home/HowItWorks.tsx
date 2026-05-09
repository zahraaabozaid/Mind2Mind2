import { UserCheck, Video, Repeat, Star } from 'lucide-react';

const steps = [
  {
    icon: UserCheck,
    step: '01',
    title: 'Create Your Expert Profile',
    description: 'List the skills you can teach with depth and genuine experience. Also share the skills you\'re eager to learn.',
    color: 'bg-cyan-50 text-cyan-600',
    borderColor: 'border-teal-100',
  },
  {
    icon: Video,
    step: '02',
    title: 'Record a Knowledge Demo',
    description: 'Film a short demo proving your teaching style. This video-verification builds trust before any exchange happens.',
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-100',
  },
  {
    icon: Repeat,
    step: '03',
    title: 'Find Your Perfect Match',
    description: 'Browse profiles where someone teaches what you want to learn — and wants to learn what you teach.',
    color: 'bg-amber-50 text-amber-600',
    borderColor: 'border-amber-100',
  },
  {
    icon: Star,
    step: '04',
    title: 'Exchange & Both Grow',
    description: 'Connect, schedule sessions, and exchange expertise. Rate each other to maintain platform quality.',
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-100',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 border border-teal-100 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            Simple Process
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            How Mind2Mind Works
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            From profile creation to mutual growth — a transparent, trust-first exchange process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent z-10 -translate-x-6" />
              )}
              <div className={`bg-white border ${step.borderColor} rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-bold text-slate-100 select-none">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
