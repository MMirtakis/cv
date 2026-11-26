"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Επισκόπηση" },
  { href: "/katayorisi", label: "Καταχώρηση" },
  { href: "/oikonomika", label: "Οικονομικά" },
  { href: "/ypoxreoseis", label: "Υποχρεώσεις" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="brand-block">
        <Link href="/" className="brand">
          Back Office
        </Link>
        <p className="brand-sub">Multi-company · Ελλάδα</p>
      </div>
      <nav className="nav" aria-label="Κύρια πλοήγηση">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "nav-link is-active" : "nav-link"}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
