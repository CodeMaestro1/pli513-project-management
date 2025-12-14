import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, error, loading, isAuthenticated } = useAuth();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result?.success) {
      navigate("/");
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
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-11"
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
                  placeholder="Enter your password"
                  className="pl-11"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <Checkbox />
                <span className="ml-2 text-slate-600">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sky-500 hover:text-sky-600 transition-colors"
              >
                Forgot password?
              </a>
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
            <a
              href="#"
              className="text-sky-500 hover:text-sky-600 transition-colors"
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}