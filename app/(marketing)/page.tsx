'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Eye,
  Sparkles,
  Zap,
  Users,
  Puzzle,
  Check,
  ArrowRight,
} from 'lucide-react';

const COMPANIES = ['Company A', 'Company B', 'Company C', 'Company D', 'Company E'];

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Kanban Boards',
    description: 'Drag-and-drop task management with customizable columns and swim lanes',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Eye,
    title: 'Multiple Views',
    description: 'Switch between Board, List, Calendar, and Timeline views instantly',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    icon: Sparkles,
    title: 'AI Smart Tasks',
    description: 'Create tasks using natural language and get intelligent suggestions',
    color: 'bg-yellow-500/10 text-yellow-600',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Trigger-based automation to eliminate repetitive work',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Comments, mentions, and live updates keep everyone in sync',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    icon: Puzzle,
    title: 'Integrations',
    description: 'Connect with Slack, GitHub, Google Drive, and 100+ tools',
    color: 'bg-pink-500/10 text-pink-600',
  },
];

const AI_FEATURES = [
  'Create tasks using plain English',
  'Smart priority suggestions based on deadlines',
  'Risk alerts before critical deadlines',
];

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out TaskFlow',
    features: [
      '10 projects',
      '3 team members',
      'Basic views',
      'Limited AI features',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/user/month',
    description: 'For growing teams',
    badge: 'Most Popular',
    features: [
      'Unlimited projects',
      'Unlimited team members',
      'All views',
      'Full AI features',
      'Automations + integrations',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'SSO, SCIM provisioning',
      'Advanced security controls',
      'Dedicated support',
      'Custom branding',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function LandingPage() {
  const router = useRouter();

  const handleDemoClick = async () => {
    try {
      await fetch('/api/demo', {
        method: 'POST',
      });
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Failed to enable demo mode:', err);
    }
  };

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05]" style={{ maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)' }} />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Project Management,
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Supercharged with AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              TaskFlow helps teams plan, track, and ship projects faster with AI-powered task management, smart automation, and beautiful views.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-12">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-12" onClick={handleDemoClick}>
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Free forever for small teams
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 border-y bg-muted/20">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {COMPANIES.map((company, index) => (
              <div
                key={index}
                className="h-12 w-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm font-medium"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything your team needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage projects from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                AI that actually helps
              </h2>
              <div className="space-y-4">
                {AI_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg">{feature}</p>
                  </div>
                ))}
              </div>
              <Button size="lg" className="mt-4">
                Try AI Features
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 aspect-square flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-24 w-24 mx-auto mb-4 text-primary" />
                <p className="text-2xl font-bold">AI Illustration</p>
                <p className="text-muted-foreground">Mockup placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your team's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <Card
                key={index}
                className={plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.badge && (
                      <Badge className="bg-primary">{plan.badge}</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of teams already using TaskFlow to ship faster
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 h-12">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
