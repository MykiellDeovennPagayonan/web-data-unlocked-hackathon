import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Search,
  Zap,
  Globe,
  TrendingUp,
  Users,
  Server,
  ArrowRight,
  Code2,
  Database,
  BarChart3,
  MapPin,
  MessageSquare,
  Cpu,
} from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  const categories = [
    { name: "Finance", icon: BarChart3, color: "bg-emerald-50 text-emerald-600" },
    { name: "Machine Learning", icon: Cpu, color: "bg-purple-50 text-purple-600" },
    { name: "Geolocation", icon: MapPin, color: "bg-orange-50 text-orange-600" },
    { name: "Social", icon: MessageSquare, color: "bg-pink-50 text-pink-600" },
    { name: "Data", icon: Database, color: "bg-blue-50 text-blue-600" },
    { name: "Developer Tools", icon: Code2, color: "bg-slate-50 text-slate-600" },
  ]

  const trendingApis = [
    { name: "Sentiment Analysis API", org: "NLP Labs", votes: 1243, calls: "2.4M", tags: ["ML", "NLP"] },
    { name: "Currency Exchange API", org: "FinTech Pro", votes: 892, calls: "1.8M", tags: ["Finance"] },
    { name: "Geocoding Service", org: "GeoMaps Inc", votes: 756, calls: "1.2M", tags: ["Geo"] },
    { name: "Image Recognition API", org: "VisionAI", votes: 2103, calls: "5.1M", tags: ["ML", "Vision"] },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-border-light">
        <div className="flex items-center h-full px-4 gap-4 max-w-[1440px] mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-kaggle-blue flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">API Store</span>
          </Link>
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search APIs, endpoints..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-muted border border-transparent focus:border-kaggle-blue focus:outline-none text-sm text-text-primary placeholder:text-text-muted transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-text-primary tracking-tight leading-tight">
            The World&apos;s API Proving Ground
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Discover, publish, and integrate APIs with the world&apos;s developer community. Test, benchmark, and deploy with confidence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-12 px-8 text-base rounded">
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded border-kaggle-blue text-kaggle-blue hover:bg-kaggle-blue/5">
              <Link href="/signup">Publish an API</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border-subtle bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">12.5K</p>
              <p className="mt-1 text-sm text-text-secondary">APIs Published</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">48.2M</p>
              <p className="mt-1 text-sm text-text-secondary">Monthly Calls</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">89K</p>
              <p className="mt-1 text-sm text-text-secondary">Active Developers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending APIs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-primary">Trending APIs</h2>
            <Link href="/marketplace" className="text-sm font-medium text-kaggle-blue hover:underline flex items-center gap-1">
              See all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingApis.map((api) => (
              <div
                key={api.name}
                className="group bg-white border border-border-light rounded-xl p-4 hover:border-text-muted hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="w-full h-24 bg-surface-muted rounded-lg mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-kaggle-blue transition-colors">
                  {api.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1">{api.org}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {api.votes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    {api.calls}
                  </span>
                </div>
                <div className="flex gap-1 mt-3">
                  {api.tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-sky-50 text-sky-600 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-8">Explore Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/marketplace"
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border-light bg-white hover:border-text-muted hover:bg-surface transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-text-primary">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary">Ready to share your API?</h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Join thousands of developers publishing APIs on the world&apos;s leading API marketplace.
          </p>
          <Button size="lg" asChild className="mt-8 bg-kaggle-blue hover:bg-kaggle-blue-hover text-white h-12 px-8 text-base rounded">
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="py-8 px-4 border-t border-border-light">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-kaggle-blue" />
            <span className="font-semibold text-text-primary">API Store</span>
          </div>
          <div className="flex gap-6">
            <Link href="/marketplace" className="hover:text-text-primary transition-colors">Marketplace</Link>
            <Link href="/login" className="hover:text-text-primary transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-text-primary transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
