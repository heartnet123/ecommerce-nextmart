import Link from "next/link";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. This area is
          restricted to administrators only.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
