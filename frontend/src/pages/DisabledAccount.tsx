import { Ban, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisabledAccountProps {
    userEmail: string;
    onBackToHome: () => void;

    title?: string;
    description?: string;
    statusLabel?: string;
    reasonsTitle?: string;
    reasons?: string[];

    helpTitle?: string;
    helpDescription?: string;
    supportEmail?: string;
    adminEmail?: string;
    supportButtonLabel?: string;
    adminButtonLabel?: string;
}

export function DisabledAccount({
    userEmail,
    onBackToHome,
    title = "Account Disabled",
    description = "Your account has been disabled by an administrator and you cannot access the system at this time.",
    statusLabel = "Disabled",
    reasonsTitle = "Why was your account disabled?",
    reasons = [
        "Violation of company policies or terms of service",
        "Security concerns or suspicious activity",
        "Administrative decision or account review",
        "Employee termination or end of contract",
    ],
    helpTitle = "Need Help?",
    helpDescription = "If you believe this is a mistake or would like to appeal this decision, please contact your system administrator or reach out to our support team.",
    supportEmail = "support@company.com",
    adminEmail = "admin@company.com",
    supportButtonLabel = "Contact Support",
    adminButtonLabel = "Contact Administrator",
}: DisabledAccountProps) {
    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-12">
                {/* Icon and Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ban className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl mb-3">{title}</h2>
                    <p className="text-slate-600 max-w-md mx-auto">{description}</p>
                </div>

                {/* Account Information */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-linear-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center text-white">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Account</p>
                            <p className="font-medium">{userEmail}</p>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                        <p className="text-sm text-slate-600">
                            <strong>Status:</strong> <span className="text-red-600">{statusLabel}</span>
                        </p>
                    </div>
                </div>

                {/* Why was your account disabled? */}
                <div className="mb-8">
                    <h3 className="font-medium mb-3">{reasonsTitle}</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        {reasons.map((reason) => (
                            <li key={reason} className="flex items-start gap-2">
                                <span className="text-slate-400 mt-0.5">•</span>
                                <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* What can you do? */}
                <div className="bg-sky-50 rounded-xl p-6 mb-8 border border-sky-100">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-sky-500" />
                        {helpTitle}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        {helpDescription}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                            onClick={() => window.location.href = `mailto:${supportEmail}`}
                        >
                            <Mail className="w-4 h-4" />
                            {supportButtonLabel}
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => window.location.href = `mailto:${adminEmail}`}
                        >
                            <Mail className="w-4 h-4" />
                            {adminButtonLabel}
                        </Button>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <Button
                        onClick={onBackToHome}
                        variant="outline"
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}