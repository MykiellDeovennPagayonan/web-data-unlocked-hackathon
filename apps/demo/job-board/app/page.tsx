"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, TrendingUp, MessageSquare, DollarSign, Star, Building2, Briefcase, ArrowRight } from "lucide-react"

export default function Home() {
  const { data: session } = useSession()

  if (session?.user) {
    const isOrg = session.user.role === "ORGANIZATION"
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">
              Welcome back, {session.user.name}
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              {isOrg ? "Manage your job postings and applicants" : "Find your next career opportunity"}
            </p>
            <Button asChild className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold px-8 py-3 h-auto rounded">
              <Link href={isOrg ? "/dashboard/jobs" : "/jobs"}>
                {isOrg ? "Go to My Jobs" : "Browse Jobs"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight leading-tight">
            You deserve a job that<br />loves you back.
          </h1>
          <p className="text-lg text-text-secondary mb-10">
            Search millions of jobs and get the inside scoop on companies with employee reviews and salary data.
          </p>

          {/* Search Bar */}
          <div className="bg-white border border-border-strong rounded-lg shadow-sm p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 md:border-r border-border-strong">
              <Search className="h-5 w-5 text-text-muted flex-shrink-0" />
              <Input
                placeholder="Job title, keywords, or company"
                className="border-0 shadow-none focus-visible:ring-0 h-11 text-base placeholder:text-text-muted"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <MapPin className="h-5 w-5 text-text-muted flex-shrink-0" />
              <Input
                placeholder="Location"
                className="border-0 shadow-none focus-visible:ring-0 h-11 text-base placeholder:text-text-muted"
              />
            </div>
            <div className="flex items-center px-3 py-2">
              <Link href="/jobs" className="w-full md:w-auto">
                <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold h-11 px-8 rounded w-full">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-text-secondary">
            <span className="text-text-muted">Popular:</span>
            {["Remote jobs", "Engineering jobs", "Marketing jobs", "Data Science", "Product Manager"].map((term) => (
              <Link
                key={term}
                href="/jobs"
                className="text-glassdoor-blue hover:underline font-medium"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-border-strong rounded-lg p-6 hover:border-glassdoor-green transition-colors">
              <div className="w-12 h-12 bg-glassdoor-green/10 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-glassdoor-green" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Search & Apply</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Browse millions of job listings from top companies. Filter by location, salary, job type, and more.
              </p>
              <Link href="/jobs" className="inline-flex items-center text-glassdoor-green font-semibold text-sm mt-4 hover:underline">
                Browse Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="bg-white border border-border-strong rounded-lg p-6 hover:border-glassdoor-green transition-colors">
              <div className="w-12 h-12 bg-glassdoor-green/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-glassdoor-green" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Company Reviews</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Read what employees say about working at companies. Get the real story before you apply.
              </p>
              <Link href="/jobs" className="inline-flex items-center text-glassdoor-green font-semibold text-sm mt-4 hover:underline">
                Read Reviews <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="bg-white border border-border-strong rounded-lg p-6 hover:border-glassdoor-green transition-colors">
              <div className="w-12 h-12 bg-glassdoor-green/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-glassdoor-green" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Salaries</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Know your worth. Compare salaries for your role and experience level across companies.
              </p>
              <Link href="/jobs" className="inline-flex items-center text-glassdoor-green font-semibold text-sm mt-4 hover:underline">
                Explore Salaries <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Companies */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Trending Companies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "TechCorp Inc.", rating: 4.2, reviews: 128 },
              { name: "InnovateSoft", rating: 3.8, reviews: 85 },
              { name: "DataFlow Labs", rating: 4.5, reviews: 210 },
              { name: "CloudNine Systems", rating: 4.0, reviews: 156 },
            ].map((company) => (
              <Link key={company.name} href="/jobs" className="block">
                <div className="bg-white border border-border-strong rounded-lg p-4 hover:border-glassdoor-green hover:bg-surface transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-surface rounded flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-text-muted" />
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1">{company.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(company.rating)
                              ? "text-glassdoor-green fill-glassdoor-green"
                              : "text-border-strong"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-text-primary">{company.rating}</span>
                    <span className="text-xs text-text-muted">({company.reviews})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-surface">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Ready to find your dream job?</h2>
          <p className="text-text-secondary mb-8">Join millions of job seekers who use JobBoard to find the right career.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jobs">
              <Button className="bg-glassdoor-green hover:bg-glassdoor-green-hover text-white font-bold px-8 py-3 h-auto rounded">
                Find Jobs
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="border-glassdoor-green text-glassdoor-green hover:bg-glassdoor-green/5 font-bold px-8 py-3 h-auto rounded">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
