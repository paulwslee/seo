import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-lg sm:rounded-2xl sm:px-10 text-center border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-6">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 mb-4">
            Check your email
          </h2>
          <p className="text-base text-gray-600 mb-8 leading-relaxed">
            A secure sign-in link has been sent to your email address. 
            <br className="hidden sm:block" />
            Please check your inbox (and spam folder) to securely log in.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-500 text-left border border-gray-100">
            <p className="font-medium text-gray-700 mb-1">Didn't receive the email?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Ensure the email address was correct</li>
              <li>Wait a minute and request a new link</li>
            </ul>
          </div>
          <div className="mt-6">
            <Link
              href="/login"
              className="flex items-center justify-center w-full text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
