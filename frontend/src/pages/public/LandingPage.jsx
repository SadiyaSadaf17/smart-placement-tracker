import { Link } from 'react-router-dom';
import { Building2, BarChart3, Bell, Shield, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const features = [
  { icon: Building2, title: 'Placement Drives', desc: 'Manage company drives with eligibility rules and real-time alerts.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Branch-wise stats, package distribution, and placement trends.' },
  { icon: Bell, title: 'Live Notifications', desc: 'Socket-powered updates for applications and selections.' },
  { icon: Shield, title: 'Secure Access', desc: 'JWT auth with role-based student and admin portals.' },
];

export default function LandingPage() {
  return (
    <>
      <main className="min-h-screen bg-slate-950 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-2 font-semibold text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">PT</span>
            Smart Placement Tracker
          </span>
          <span className="flex gap-3">
            <Link to="/login"><Button variant="ghost" className="text-white hover:bg-white/10">Login</Button></Link>
            <Link to="/register"><Button>Get Started</Button></Link>
          </span>
        </nav>

        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Modern placement management for <span className="text-blue-400">colleges</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Track drives, applications, analytics, and student progress in one professional SaaS platform.
          </p>
          <span className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register"><Button size="lg">Register as Student <ArrowRight size={18} /></Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="border-slate-600 text-white">Admin Login</Button></Link>
          </span>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <Icon className="mb-4 text-blue-400" size={28} />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{desc}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
