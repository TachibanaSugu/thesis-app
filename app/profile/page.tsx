import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { MongoClient } from "mongodb";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import ProfileTabs from "./ProfileTabs";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db("thesis_database");
  
  // Find orders where userId matches the session email, sorted newest first
  const orders = await db
    .collection("orders")
    .find({ userId: session.user?.email })
    .sort({ orderDate: -1 })
    .toArray();
    
  await client.close();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter italic">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">TECHBUILDZ</span>.AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Store</Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-10 flex items-center gap-6 pb-8 border-b border-slate-800">
           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]">
             {session.user?.name?.charAt(0) || "U"}
           </div>
           <div>
             <h1 className="text-3xl font-black text-white mb-1">{session.user?.name}</h1>
             <p className="text-slate-400 font-mono text-sm">{session.user?.email}</p>
             <p className="inline-block mt-2 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700">Account Type: {(session.user as any)?.role}</p>
           </div>
        </div>

          <ProfileTabs orders={JSON.parse(JSON.stringify(orders))} />
      </main>
    </div>
  );
}
