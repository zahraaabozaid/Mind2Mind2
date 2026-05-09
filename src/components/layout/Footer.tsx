import { Brain, Twitter, Linkedin, Github } from 'lucide-react';
import { Page } from '../../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Mind<span className="text-teal-400">2</span>Mind
              </span>
            </button>
            <p className="text-sm leading-relaxed mb-6">
              Trade what you know. Learn what you need. A platform for genuine expertise exchange — no money, just knowledge.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <div key={i} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              {['Browse Skills', 'Knowledge Demos', 'How It Works', 'Success Stories'].map(item => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('browse')}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Top Skills</h4>
            <ul className="space-y-3 text-sm">
              {['Web Development', 'UI/UX Design', 'Language Learning', 'Music Production', 'Fitness Training', 'Cooking'].map(item => (
                <li key={item}>
                  <button className="hover:text-teal-400 transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              {['About Us', 'Careers', 'Blog', 'Press Kit', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <button className="hover:text-teal-400 transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 Mind2Mind. All rights reserved.</p>
          <p className="text-sm">Made with purpose — knowledge belongs to everyone.</p>
        </div>
      </div>
    </footer>
  );
}
