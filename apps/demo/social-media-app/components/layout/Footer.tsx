const footerLinks = [
  "Help", "Status", "About", "Careers", "Press", "Blog",
  "Privacy", "Rules", "Terms", "Text to speech",
]

interface FooterProps {
  borderTop?: boolean
}

export function Footer({ borderTop = false }: FooterProps) {
  return (
    <footer className={`bg-[#F7F4ED] ${borderTop ? "border-t border-[#E5E5E5]" : ""}`}>
      <div className="max-w-[1192px] mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <span
              key={link}
              className="text-[13px] text-[#757575] cursor-default"
            >
              {link}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
