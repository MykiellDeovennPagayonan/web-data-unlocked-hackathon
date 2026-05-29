import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F4ED] flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E5E5E5] flex-1">
        <div className="max-w-[1192px] mx-auto px-6">
          <div className="flex items-center min-h-[500px] md:min-h-[600px]">
            <div className="max-w-[600px] py-16 md:py-24">
              <h1
                className="text-[48px] md:text-[70px] lg:text-[90px] font-bold leading-[0.95] tracking-[-0.03em] mb-8 text-[#242424]"
                style={{ fontFamily: '"GT Super", Georgia, serif' }}
              >
                Write your world.<br />&amp; share what matters
              </h1>
              <p className="text-[18px] md:text-[20px] text-[#6B6B6B] leading-relaxed mb-10 max-w-[420px]">
                A space for thoughtful voices, curious readers, and ideas that shape how you see the world.
              </p>
              <Button
                asChild
                className="rounded-full px-6 h-[40px] text-[14px] font-medium bg-[#FFC017] text-[#242424] hover:bg-[#E5AC00] border-none"
              >
                <Link href="/feed">Explore stories</Link>
              </Button>
            </div>

            {/* Editorial illustration (desktop) */}
            <div className="hidden lg:flex flex-1 justify-end items-center">
              <div className="relative w-[480px] h-[450px]">
                <img src="/girl_writing.svg" alt="Girl writing illustration" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
