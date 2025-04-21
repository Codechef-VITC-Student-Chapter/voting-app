import React from 'react';
import { Ban } from 'lucide-react';
import Link from 'next/link';

const YouCantLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-200">
      <div className="bg-white shadow-xl rounded-xl p-8 flex flex-col items-center max-w-md border border-red-300">
        <Ban className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-700 text-center mb-4">
          Sorry, you can&apos;t login or signup with this email address.
        </p>
        <p className="text-gray-500 text-center text-sm">
          If you believe this is a mistake, please contact the administrator or check if your email is on the allowed list.
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default YouCantLogin;
