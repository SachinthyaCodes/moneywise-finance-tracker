import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Welcome to MoneyWise</h1>
      <p>Manage your finances easily with income tracking, expenses, and AI insights.</p>

      {/* Button to Navigate to Income Page */}
      <Link href="/income">
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Go to Income Tracker
        </button>
      </Link>
    </main>
  );
}
