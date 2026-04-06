import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="text-center relative z-10">
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-slate-600 to-slate-800 select-none">
            404
          </h1>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Looks like this component doesn&apos;t exist in our database. Let&apos;s get you back to building.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3.5 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
          >
            Go to Store
          </Link>
          <Link
            href="/admin"
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-colors border border-slate-700"
          >
            Admin Panel
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-xs font-bold text-slate-600">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">PCpartSmart</span>
          </p>
        </div>
      </div>
    </div>
  );
}
