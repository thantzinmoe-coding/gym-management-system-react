import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, Menu, X } from 'lucide-react';

export function Navbar() {
  const navItems = [
    { name: 'Home', href: '/Index' },
    { name: 'About Us', href: '/AboutUs' },
    { name: 'Contact Us', href: '/ContactUS' },
    { name: 'Reviews', href: '/Reviews' },
  ];

  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground">FitGym</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="sm:h-10 sm:px-4">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="sm:h-10 sm:px-4">Join Now</Button>
            </Link>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(o => !o)}
              className="md:hidden p-2 rounded-md hover:bg-muted"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-border py-2">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href} onClick={() => setOpen(false)} className="block px-2 py-3 text-foreground hover:text-primary">
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}


