export default function Home() {
  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold">Welcome to Abyss Watchers 🚀</h1>
      <p className="mt-4">Navigate to <a href="/login" className="text-blue-600">/login</a> to sign in or <a href="/dashboard" className="text-blue-600">/dashboard</a> after login.</p>
    </main>
  );
}
