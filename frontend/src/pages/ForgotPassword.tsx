import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordProps {
    onBackToLogin: () => void;
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd send a password reset email here
        console.log("Password reset requested for:", email);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-12">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl mb-3">Check Your Email</h2>
                        <p className="text-slate-600 max-w-md mx-auto">
                            If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
                        </p>
                    </div>

                    <div className="bg-sky-50 rounded-xl p-6 mb-8 border border-sky-100">
                        <h3 className="font-medium mb-3">What's next?</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="text-sky-500 mt-0.5">1.</span>
                                <span>Check your email inbox (and spam folder)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-500 mt-0.5">2.</span>
                                <span>Click the password reset link in the email</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-500 mt-0.5">3.</span>
                                <span>Create a new password for your account</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-500 mt-0.5">4.</span>
                                <span>Login with your new password</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={onBackToLogin}
                            className="flex-1 gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Button>
                        <Button
                            onClick={() => setSubmitted(false)}
                            variant="outline"
                            className="flex-1"
                        >
                            Try Another Email
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-sky-500" />
                    </div>
                    <h2 className="text-3xl mb-3">Forgot Password?</h2>
                    <p className="text-slate-600 max-w-md mx-auto">
                        No worries! Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="pl-11"
                                required
                            />
                        </div>
                        <p className="text-sm text-slate-500">
                            We'll send password reset instructions to this email if it exists in our system.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="submit"
                            className="flex-1 gap-2 group"
                            disabled={!email}
                        >
                            Send Reset Link
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            type="button"
                            onClick={onBackToLogin}
                            variant="outline"
                            className="flex-1 gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Button>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                    <p className="text-sm text-slate-600 text-center">
                        Need help? Contact{" "}
                        <a href="mailto:support@company.com" className="text-sky-500 hover:text-sky-600 transition-colors">
                            support@company.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
