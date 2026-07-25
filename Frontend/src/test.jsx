export default function Test() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold text-pink-600 mb-4">
          Tailwind is Working! 🎉
        </h1>
        <button className="btn-primary">
          Test Button
        </button>
        <p className="mt-4 text-gray-600">
          If this is pink, Tailwind is configured correctly!
        </p>
      </div>
    </div>
  );
}