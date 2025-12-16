import { Clock, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingApprovalProps {
  userEmail?: string;
  onBackToHome: () => void;
}

export function PendingApproval({ userEmail, onBackToHome }: PendingApprovalProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-linears-to-r from-amber-400 to-amber-500 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl mb-2">Account Pending Approval</h1>
          <p className="text-amber-50">
            Your registration was successful!
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Success Message */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 mb-1">
                  Registration Completed
                </h3>
                <p className="text-sm text-green-700">
                  Thank you for signing up! Your account has been created successfully.
                </p>
              </div>
            </div>

            {/* Email Confirmation */}
            {userEmail && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">Account registered for:</p>
                  <p className="font-medium text-slate-900">{userEmail}</p>
                </div>
              </div>
            )}

            {/* What's Next Section */}
            <div className="space-y-4">
              <h2 className="text-xl">What happens next?</h2>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Admin Review</h4>
                    <p className="text-sm text-slate-600">
                      Our team will review your registration request. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email Notification</h4>
                    <p className="text-sm text-slate-600">
                      You'll receive an email notification once your account has been approved.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Start Using the Platform</h4>
                    <p className="text-sm text-slate-600">
                      After approval, you can log in and start managing your projects immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm text-sky-900">
                <strong>Need help?</strong> If you have any questions or haven't received a response within 2 business days, please contact our support team at{" "}
                <a href="mailto:support@projectmanagement.com" className="text-sky-600 hover:text-sky-700 underline">
                  support@projectmanagement.com
                </a>
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                onClick={onBackToHome}
                variant="outline"
                className="w-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
