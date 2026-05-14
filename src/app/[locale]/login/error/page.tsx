'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let title = "Authentication Error";
  let message = "An error occurred during the sign in process. Please try again.";

  if (error === 'Verification') {
    title = "Link Expired or Invalid";
    message = "The sign in link is no longer valid. It may have been used already or it may have expired after 15 minutes. Please request a new login link.";
  } else if (error === 'Configuration') {
    title = "Server Configuration Error";
    message = "There is a problem with the server configuration. Please contact the administrator.";
  } else if (error === 'AccessDenied') {
    title = "Access Denied";
    message = "You do not have permission to sign in at this time.";
  }

  return (
    <div className="bg-white py-10 px-4 shadow-lg sm:rounded-2xl sm:px-10 text-center border border-gray-100">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 mb-4">
        {title}
      </h2>
      <p className="text-base text-gray-600 mb-8 leading-relaxed">
        {message}
      </p>
      
      {error === 'Verification' && (
        <div className="bg-orange-50 text-orange-800 text-sm p-4 rounded-xl mb-8 text-left border border-orange-100">
          <p className="font-semibold mb-1">Why did this happen?</p>
          <ul className="list-disc pl-5 space-y-1 opacity-90">
            <li>You already clicked this link previously.</li>
            <li>More than 15 minutes have passed since you requested it.</li>
            <li>You requested a newer link, which invalidated this one.</li>
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-xl border border-transparent bg-blue-600 py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Request a New Link
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center w-full rounded-xl py-3.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="bg-white py-10 px-4 shadow-lg sm:rounded-2xl sm:px-10 text-center border border-gray-100">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-20 w-20 bg-gray-100 rounded-full mb-6"></div>
        <div className="h-8 w-3/4 bg-gray-100 rounded mb-4"></div>
        <div className="h-16 w-full bg-gray-50 rounded mb-8"></div>
        <div className="h-12 w-full bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<ErrorFallback />}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
