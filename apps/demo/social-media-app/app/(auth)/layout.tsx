export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F7F4ED] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        {children}
      </div>
    </div>
  )
}
