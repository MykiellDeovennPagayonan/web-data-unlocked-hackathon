import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t border-border-strong mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h3 className="font-bold text-text-primary mb-3 text-sm">Browse Jobs</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Remote jobs</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Engineering</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Marketing</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Design</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-3 text-sm">Salaries</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Salary Calculator</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">By Company</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">By Title</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">By Location</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-3 text-sm">Companies</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Reviews</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Interviews</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Benefits</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Photos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-3 text-sm">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup/organization" className="text-text-secondary hover:text-glassdoor-green">Post a Job</Link></li>
              <li><Link href="/dashboard/jobs" className="text-text-secondary hover:text-glassdoor-green">Manage Listings</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Employer Branding</Link></li>
              <li><Link href="/jobs" className="text-text-secondary hover:text-glassdoor-green">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-3 text-sm">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-text-secondary hover:text-glassdoor-green">Sign In</Link></li>
              <li><Link href="/signup" className="text-text-secondary hover:text-glassdoor-green">Create Account</Link></li>
              <li><Link href="/dashboard/applications" className="text-text-secondary hover:text-glassdoor-green">My Applications</Link></li>
              <li><Link href="/dashboard/jobs" className="text-text-secondary hover:text-glassdoor-green">My Jobs</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-surface-alt flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} JobBoard. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-text-primary">Privacy</Link>
            <Link href="/" className="hover:text-text-primary">Terms</Link>
            <Link href="/" className="hover:text-text-primary">Cookies</Link>
            <Link href="/" className="hover:text-text-primary">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
