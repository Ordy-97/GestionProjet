'use client';

import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div>
      <ResetPasswordForm />
      <div className="text-center mt-4">
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
} 