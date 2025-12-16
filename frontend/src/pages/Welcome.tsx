import { ArrowRight, CheckCircle2, Users, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function Welcome({ onSignIn, onSignUp }: WelcomeProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <div className="w-24 h-24 bg-linear-to-br from-sky-400 to-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sky-500/30">
            <div className="w-14 h-14 border-4 border-white rounded-xl rotate-45"></div>
          </div>
          <h1 className="text-5xl mb-4">
            <span className="font-semibold">Project</span>
            <span className="font-light"> Management</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Streamline your workflow and boost productivity with powerful project management tools designed for modern teams
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Button
            onClick={onSignUp}
            className="px-8 py-6 text-lg gap-2 group min-w-50"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={onSignIn}
            variant="outline"
            className="px-8 py-6 text-lg min-w-50"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-sky-500" />
          </div>
          <h3 className="text-xl mb-3">Goal Tracking</h3>
          <p className="text-slate-600">
            Set clear objectives and track progress with intuitive dashboards and real-time updates
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-sky-500" />
          </div>
          <h3 className="text-xl mb-3">Team Collaboration</h3>
          <p className="text-slate-600">
            Work together seamlessly with shared workspaces, comments, and file sharing
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-sky-500" />
          </div>
          <h3 className="text-xl mb-3">Workflow Automation</h3>
          <p className="text-slate-600">
            Automate repetitive tasks and focus on what matters most to your team
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-linear-to-br from-sky-400 to-sky-500 rounded-2xl p-12 text-white shadow-xl">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl mb-8 text-center">Why teams choose us</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h4 className="mb-1">Easy to use</h4>
                <p className="text-sky-50 text-sm">
                  Intuitive interface that your team will love from day one
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h4 className="mb-1">Real-time updates</h4>
                <p className="text-sky-50 text-sm">
                  Stay in sync with instant notifications and live collaboration
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h4 className="mb-1">Secure & reliable</h4>
                <p className="text-sky-50 text-sm">
                  Enterprise-grade security to keep your data safe
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h4 className="mb-1">Mobile ready</h4>
                <p className="text-sky-50 text-sm">
                  Access your projects anywhere, anytime on any device
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
