import { useEffect, useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sanitizeLoginIdentifier } from "@/lib/sanitize";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [usernameWarning, setUsernameWarning] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, error, loading, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = sanitizeLoginIdentifier(username);
    if (identifier !== username) setUsername(identifier);
    const result = await login(identifier, password);
    if (result?.success) {
      const status = typeof result.user?.status === 'string' ? result.user.status.toUpperCase() : undefined;
      if (status === 'PENDING' && result.user?.email) {
        navigate("/pending-approval", { state: { userEmail: result.user.email } });
        return;
      }
      if (status === 'DISABLED' && result.user?.email) {
        navigate("/disabled-account", { state: { userEmail: result.user.email } });
        return;
      }
      navigate("/dashboard");
      return;
    }

    if (result?.code === 'ACCOUNT_PENDING') {
      // Backend rejected login (403) because the account is pending approval.
      navigate('/pending-approval', { state: { userEmail: identifier } });
      return;
    }

    if (result?.code === 'ACCOUNT_DISABLED' || result?.code === 'ACCOUNT_NOT_ACTIVE') {
      // Backend rejected login (403) because the account is not active.
      // We don't have the email from the backend in this case; show what the user typed.
      navigate('/disabled-account', { state: { userEmail: identifier } });
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
              Streamline your workflow
            </p>
            <p className="text-sm opacity-75 max-w-xs mx-auto">
              Organize, track, and manage your projects with
              powerful tools designed for modern teams.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="p-12 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">Welcome Back</h2>
            <p className="text-slate-600">
              Please login to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username or Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const clean = sanitizeLoginIdentifier(raw);
                    setUsername(clean);
                    setUsernameWarning(raw !== clean ? "Special characters are not allowed." : null);
                  }}
                  placeholder="Enter your username"
                  className="pl-11"
                />
              </div>
              {usernameWarning && (
                <p className="text-sm text-red-600">{usernameWarning}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-11 pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <Checkbox />
                <span className="ml-2 text-slate-600">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sky-500 hover:text-sky-600 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full py-3 gap-2 group"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
            >
              Create an account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}