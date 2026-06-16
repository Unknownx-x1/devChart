import Navbar from "@/components/Navbar"
import Link from "next/link";
import connectDB from "@/lib/mongodb";

export default async function Home() {
  await connectDB();

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: "#ffe4c4" }}>
      <Navbar />
      <div className="flex flex-wrap items-center justify-center m-3 gap-8">
        <div className="max-w-xl flex flex-col items-start gap-5">
          <h1 className="text-9xl font-black text-teal-200 mt-18 text-outline-black tracking-wider">
            devChart
          </h1>
          <div className="font-semibold text-2xl text-black">
            <h3 className="mb-2">A professional project collaboration platform built for technical student clubs.</h3>
            <h2>Get aligned, assign tasks, and build momentum.</h2>
          </div>
          <Link href="/dashboard" className="mt-4">
            <button className="py-3 px-8 bg-teal-200 text-black text-lg font-black border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-teal-300 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
              Go to Workspace →
            </button>
          </Link>
        </div>
        <img src="/logo.svg" alt="Logo" className="w-xl h-auto mx-auto my-6" />
      </div>
    </div>
  );
}