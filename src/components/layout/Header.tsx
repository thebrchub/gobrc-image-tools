
import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const links = [
  { label: 'Compressor', to: '/image-compressor' },
  { label: 'Converter', to: '/image-converter' },
  { label: 'Resize & Crop', to: '/image-resizer' },
  { label: 'Social Images', to: '/social-image-maker' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-[#FFF0E9] text-[#D9512B]'
        : 'text-[#6F6A64] hover:bg-[#F3EEE7] hover:text-[#242323]'
    }`;

  const handleTryTool = () => {
    setMenuOpen(false);

    if (location.pathname === '/') {
      document.getElementById('tools')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      navigate('/#tools');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E9E1D8] bg-[#F9F7F3]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
       <Link
  to="/"
  aria-label="GoBRC Image Tools home"
  className="flex shrink-0 items-center rounded-lg"
>
  <img
    src="/logo.webp"
    alt="GoBRC Image Tools"
    className="h-14 w-auto object-contain sm:h-18"
    width="300"
    height="80"
  />
</Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleTryTool}
          className="hidden min-h-10 items-center gap-2 rounded-lg bg-[#F36B45] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#D9512B] sm:inline-flex"
        >
          Try a tool
          <ArrowUpRight size={16} />
        </button>

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E9E1D8] bg-white text-[#242323] lg:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-[#E9E1D8] bg-[#F9F7F3] px-5 py-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `mb-1 flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? 'bg-[#FFF0E9] text-[#D9512B]'
                    : 'text-[#514D48] hover:bg-[#F3EEE7]'
                }`
              }
            >
              {item.label}
              <ArrowUpRight size={15} />
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleTryTool}
            className="mt-3 flex w-full items-center justify-center gap-2 bg-[#F36B45] px-4 py-3 text-sm font-bold text-white hover:bg-[#D9512B]"
          >
            Try a tool
            <ArrowUpRight size={16} />
          </button>

          <div className="mt-3 flex items-center gap-2 border-t border-[#E9E1D8] pt-4 text-xs text-[#817970]">
            <Sparkles size={14} className="text-[#E65E38]" />
            Simple tools for everyday image tasks
          </div>
        </nav>
      )}
    </header>
  );
}
