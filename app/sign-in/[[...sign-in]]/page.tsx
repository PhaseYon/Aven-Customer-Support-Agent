import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back to Aven Customer Support
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
              formButtonPrimary: "bg-primary-600 hover:bg-primary-700 text-white",
              headerTitle: "text-gray-900 dark:text-white",
              headerSubtitle: "text-gray-600 dark:text-gray-400",
            }
          }}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  )
} 