import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import {
  BRANDS,
  BrandName,
  CATEGORIES,
  CategoryName,
  CurrencyCode,
  Motorcycle,
} from '../data/motorcycles';
import { PartVariant, SparePart } from '../data/spareParts';
import { GlobalSearch } from './GlobalSearch';

export type NavSection = 'models' | 'spare-parts' | 'services' | 'experience';

interface TopNavBarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  selectedBrand: 'All' | BrandName;
  onSelectBrand: (brand: 'All' | BrandName) => void;
  selectedCategory: 'All' | CategoryName;
  onSelectCategory: (category: 'All' | CategoryName) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenOrder: () => void;
  currency: CurrencyCode;
  onToggleCurrency: (currency: CurrencyCode) => void;
  motorcycles: Motorcycle[];
  spareParts: SparePart[];
  whatsappNumber: string;
  onSelectMotorcycleSearch: (bike: Motorcycle) => void;
  onSelectPartSearch: (part: SparePart) => void;
  onAddPartToBag: (
    part: SparePart,
    quantity: number,
    variant?: PartVariant
  ) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeSection,
  onSelectSection,
  selectedBrand,
  onSelectBrand,
  selectedCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenAccount,
  onOpenOrder,
  currency,
  onToggleCurrency,
  motorcycles,
  spareParts,
  whatsappNumber,
  onSelectMotorcycleSearch,
  onSelectPartSearch,
  onAddPartToBag,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenMobileSearch = () => {
      setMobileSearchOpen(true);
      setMobileMenuOpen(false);
    };
    window.addEventListener('osas-open-mobile-search', handleOpenMobileSearch);
    return () =>
      window.removeEventListener(
        'osas-open-mobile-search',
        handleOpenMobileSearch
      );
  }, []);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileMenuOpen]);

  const navItems: Array<{ id: NavSection; label: string; mobileLabel: string }> =
    [
      { id: 'models', label: 'Models', mobileLabel: 'Models' },
      { id: 'spare-parts', label: 'Spare Parts', mobileLabel: 'Spare Parts' },
      { id: 'services', label: 'Services', mobileLabel: 'Financing' },
      { id: 'experience', label: 'Experience', mobileLabel: 'Showroom Info' },
    ];

  return (
    <header className="relative z-40 w-full h-16 md:h-auto px-4 sm:px-6 xl:px-8 md:pt-5 md:pb-3 flex items-center">
      <div className="w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Custom Red Geometric Hexagon Emblem + Osas Motorcycle */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('models');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 sm:gap-2.5 group whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] rounded-xl pr-1"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-black/[0.04] transition-transform duration-200 group-hover:scale-105">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
                fill="#DC2626"
              />
              <path
                d="M12 5.4L17.7 8.7V15.3L12 18.6L6.3 15.3V8.7L12 5.4Z"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M12 5.4V12L17.7 15.3M12 12L6.3 15.3"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-[15.5px] xl:text-[17px] font-bold tracking-tight text-[#18181B]">
            Osas <span className="text-[#DC2626]">Motorcycle</span>
          </span>
        </a>

        {/* Center Navigation Pills (Desktop) */}
        <nav
          aria-label="Primary Showroom Navigation"
          className="hidden lg:flex items-center gap-1.5 xl:gap-2"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`px-3.5 xl:px-5 py-2 rounded-full text-[12px] xl:text-[13px] font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] ${
                  isActive
                    ? 'bg-[#18181B] text-white shadow-[0_6px_18px_rgba(24,24,27,0.18)]'
                    : 'bg-white text-[#18181B] hover:bg-zinc-50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Brand Filter Dropdown Pill */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              className="flex items-center gap-1.5 px-3.5 xl:px-4.5 py-2 rounded-full text-[12px] xl:text-[13px] font-medium bg-white text-[#18181B] hover:bg-zinc-50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            >
              <span>
                {selectedBrand === 'All' ? 'All Brands' : selectedBrand}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="listbox"
                aria-label="Filter motorcycles by brand"
                className="absolute left-0 mt-2 w-48 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_14px_34px_rgba(0,0,0,0.1)] border border-black/[0.06] py-1.5 z-50"
              >
                {BRANDS.map((brand) => {
                  const active = selectedBrand === brand;
                  return (
                    <button
                      key={brand}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onSelectBrand(brand);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'bg-zinc-100 text-[#18181B] font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-[#18181B]'
                      }`}
                    >
                      <span>{brand === 'All' ? 'All Brands' : brand}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Global Instant Search (Desktop inline pill + Mobile expanded bar) */}
        <GlobalSearch
          currency={currency}
          motorcycles={motorcycles}
          spareParts={spareParts}
          whatsappNumber={whatsappNumber}
          onSelectMotorcycle={onSelectMotorcycleSearch}
          onSelectPart={onSelectPartSearch}
          onAddPartToBag={onAddPartToBag}
          mobileExpanded={mobileSearchOpen}
          onCloseMobile={() => setMobileSearchOpen(false)}
        />

        {/* Right Utility Controls
            On mobile (< 768px): strictly 3 circular icon buttons (Search, Bag, Hamburger) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile / Tablet Search Icon Trigger */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setMobileMenuOpen(false);
            }}
            aria-label="Toggle search bar"
            aria-expanded={mobileSearchOpen}
            className={`lg:hidden w-10 h-10 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] ${
              mobileSearchOpen
                ? 'bg-[#18181B] text-white'
                : 'bg-white text-[#18181B] hover:bg-zinc-50'
            }`}
          >
            <Search className="w-[17px] h-[17px]" strokeWidth={1.85} />
          </button>

          {/* Shopping Bag */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping bag (${cartCount} items)`}
            className="relative w-10 h-10 rounded-full bg-white text-[#18181B] hover:bg-zinc-50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] inline-flex items-center justify-center transition-transform duration-150 hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
          >
            <ShoppingBag className="w-[17px] h-[17px]" strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Dealer Login (Tablet/Desktop; mobile uses Slide-Over Drawer -> Dealer Portal) */}
          <button
            type="button"
            onClick={onOpenAccount}
            aria-label="Open dealer portal and rider account"
            className="hidden md:inline-flex w-10 h-10 rounded-full bg-white text-[#18181B] hover:bg-zinc-50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] items-center justify-center transition-transform duration-150 hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
          >
            <User className="w-[17px] h-[17px]" strokeWidth={1.75} />
          </button>

          {/* Primary Order CTA (Tablet/Desktop; mobile uses Sticky Bottom Bar) */}
          <button
            type="button"
            onClick={onOpenOrder}
            className="hidden md:inline-flex px-4 sm:px-5 xl:px-6 py-2.5 rounded-full bg-[#18181B] text-white text-[12.5px] xl:text-[13px] font-medium hover:bg-zinc-800 shadow-[0_6px_18px_rgba(24,24,27,0.16)] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
          >
            Order
          </button>

          {/* Hamburger Menu Button (Mobile & Tablet < lg) */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(true);
              setMobileSearchOpen(false);
            }}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden w-10 h-10 rounded-full bg-white text-[#18181B] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] inline-flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-[18px] h-[18px]" strokeWidth={1.85} />
          </button>
        </div>
      </div>

      {/* Sleek Slide-Over Mobile Drawer (< lg) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div
            className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <span className="text-[16px] font-bold text-[#18181B]">
                  Osas <span className="text-[#DC2626]">Motorcycle</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Navigation Links */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Showroom Navigation
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-[13px] font-semibold text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#18181B] text-white'
                            : 'bg-[#F3F3F5] text-[#18181B] hover:bg-zinc-200/70'
                        }`}
                      >
                        {item.mobileLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Bike Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onSelectCategory(category);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3.5 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-[#F3F3F5] text-[#18181B]'
                      }`}
                    >
                      {category === 'All' ? 'All Categories' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter Pills */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Filter by Brand
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {BRANDS.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        onSelectBrand(brand);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3.5 py-2 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
                        selectedBrand === brand
                          ? 'bg-[#18181B] text-white'
                          : 'bg-[#F3F3F5] text-zinc-700'
                      }`}
                    >
                      {brand === 'All' ? 'All Brands' : brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F3F3F5]">
                <span className="text-[13px] font-semibold text-[#18181B]">
                  Display Currency
                </span>
                <div className="inline-flex items-center rounded-full bg-white p-0.5 border border-black/[0.06]">
                  {(['NGN', 'USD'] as CurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onToggleCurrency(code)}
                      className={`px-3 py-1 rounded-full text-[11.5px] font-semibold cursor-pointer ${
                        currency === code
                          ? 'bg-[#18181B] text-white'
                          : 'text-zinc-600'
                      }`}
                    >
                      {code === 'NGN' ? '₦ NGN' : '$ USD'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Dealer Portal + Order */}
            <div className="pt-5 mt-6 border-t border-zinc-100 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOrder();
                }}
                className="w-full min-h-[44px] py-3 rounded-full bg-[#18181B] text-white text-[13.5px] font-semibold cursor-pointer"
              >
                Order Selected Bike
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className="w-full min-h-[44px] py-2.5 rounded-full bg-[#F3F3F5] hover:bg-zinc-200/80 text-[#18181B] text-[13px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
                <span>Dealer Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
