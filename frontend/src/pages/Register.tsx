import { useState } from "react";
import { Mail, Lock, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      console.error("Passwords don't match!");
      return;
    }
    
    if (!agreeToTerms) {
      console.error("Please agree to the terms and conditions");
      return;
    }
    
    console.log("Registration attempted with:", {
      fullName,
      email,
      password,
    });
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
      {/* Left Panel - Branding & Welcome */}
      <div className="bg-linear-to-br from-sky-400 to-sky-500 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 border-4 border-white rounded-lg rotate-45"></div>
            </div>
            <h1 className="text-3xl mb-2">
              <span className="font-semibold">Project</span>
              <span className="font-light"> Management</span>
            </h1>
          </div>

          <div className="space-y-4 mt-12">
            <p className="text-lg opacity-90">
              Join thousands of teams
            </p>
            <p className="text-sm opacity-75 max-w-xs mx-auto">
              Start managing your projects more efficiently today.
              Sign up in seconds and experience seamless collaboration.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="p-12 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">Create Account</h2>
            <p className="text-slate-600">
              Sign up to get started with your projects
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox 
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms((e.target as HTMLInputElement).checked)}
                className="mt-1"
              />
              <label className="text-sm text-slate-600 cursor-pointer">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-sky-500 hover:text-sky-600 transition-colors"
                >
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-sky-500 hover:text-sky-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full py-3 gap-2 group"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <a
              href="#"
              className="text-sky-500 hover:text-sky-600 transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
