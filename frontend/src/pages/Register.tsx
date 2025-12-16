import { useState } from "react";
import { Mail, Lock, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

// Helper to safely extract error messages without using `any`
function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybe = err as { message?: string; response?: { data?: { message?: string } } };
    return maybe.response?.data?.message ?? maybe.message ?? "Registration failed";
  }
  return "Registration failed";
}

export function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("Both first name and last name are required");
      return;
    }

    try {
      setSubmitting(true);
      await authService.register({
        username: username.trim(),
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Navigate to the PendingApproval page after successful registration
      navigate("/pending-approval", { state: { userEmail: email.trim() } });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
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
      <div className="p-8 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-2xl mb-1">Create Account</h2>
            <p className="text-slate-600 text-sm">
              Sign up to get started with your projects
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="pl-10 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              {/* First Name Field */}
              <div className="flex-1 space-y-1">
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="pl-10 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div className="flex-1 space-y-1">
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="pl-10 py-2 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-10 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 py-2 text-sm"
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
              <label className="text-xs text-slate-600 cursor-pointer">
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
              disabled={submitting}
              className="w-full py-2 gap-2 group text-sm"
            >
              {submitting ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {error && (
            <div className="mt-3 text-xs text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-sky-500 hover:text-sky-600 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
