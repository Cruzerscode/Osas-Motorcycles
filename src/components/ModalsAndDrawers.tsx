import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  COLOR_OPTIONS,
  ColorOption,
  CurrencyCode,
  MOTORCYCLES,
  Motorcycle,
  formatMoney,
  isTricycle,
} from '../data/motorcycles';
import { PaintedBikeImage } from './PaintedBikeImage';
import { StudioImage } from './StudioImage';

export interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  priceUSD: number;
  priceNGN: number;
  image: string;
  filterStyle?: string;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  date: string;
  title: string;
  detail: string;
  totalFormatted: string;
  status: string;
  customerName?: string;
  whatsapp?: string;
  deliveryLocation?: string;
  paymentMethod?: string;
  colorName?: string;
  quantity?: number;
  totalNGN?: number;
  orderType?: 'Motorcycle' | 'Tricycle' | 'Spare Parts & Gear';
}

export interface TestRideRecord {
  id: string;
  date: string;
  timeSlot: string;
  showroom: string;
  bikeTitle: string;
  riderName: string;
  whatsapp: string;
  status: string;
}

export interface TradeInRecord {
  id: string;
  submittedAt: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  condition: string;
  whatsapp: string;
  targetBike: string;
  estimatedRange: string;
  status: string;
  type?: 'Trade-In' | 'Part Request';
  notes?: string;
}

export interface FinancingPlanSummary {
  bikeId: string;
  downPaymentPercent: number;
  months: number;
  monthlyUSD: number;
  monthlyNGN: number;
  downPaymentUSD: number;
  downPaymentNGN: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: CurrencyCode;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckoutSuccess: (order: OrderRecord) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
  items,
  currency,
  onUpdateQty,
  onRemoveItem,
  onCheckoutSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutDone, setCheckoutDone] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setCheckoutDone(null);
  }, [open]);

  if (!open) return null;

  const subtotalUSD = items.reduce(
    (sum, item) => sum + item.priceUSD * item.quantity,
    0
  );
  const subtotalNGN = items.reduce(
    (sum, item) => sum + item.priceNGN * item.quantity,
    0
  );

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const orderCode = `OS-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalStr = formatMoney(subtotalUSD, subtotalNGN, currency);
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    onCheckoutSuccess({
      id: orderCode,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      title: `${totalQty} Spare Parts & Riding Gear`,
      detail: items.map((i) => `${i.quantity}× ${i.title}`).join(', '),
      totalFormatted: totalStr,
      status: 'Pending',
      customerName: customerName.trim(),
      whatsapp: customerPhone.trim(),
      deliveryLocation: deliveryAddress.trim(),
      paymentMethod: 'Pay on Delivery / Transfer',
      quantity: totalQty,
      totalNGN: subtotalNGN,
      orderType: 'Spare Parts & Gear',
    });
    setCheckoutDone(orderCode);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#18181B]" />
              <h2 className="text-[18px] font-bold text-[#18181B]">
                Shopping Bag
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close shopping bag"
              className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {checkoutDone ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-[20px] font-bold text-[#18181B]">
                Order #{checkoutDone} Confirmed
              </h3>
              <p className="mt-2 text-[14px] text-[#71717A]">
                Our gear concierge is preparing your items for dispatch. You can
                review this receipt inside your Rider Garage.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-medium hover:bg-zinc-800 cursor-pointer"
              >
                Return to Showroom
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 inline-flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="mt-4 text-[15px] font-semibold text-[#18181B]">
                Your bag is empty
              </p>
              <p className="mt-1 text-[13px] text-[#71717A]">
                Click Buy Now on any motorcycle riding gear card to add
                helmets, gloves, or boots here.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#F3F3F5] border border-black/[0.04]"
                >
                  <div className="w-16 h-16 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center">
                    <StudioImage
                      src={item.image}
                      alt={item.title}
                      loading="eager"
                      fallbackType="part"
                      style={{ filter: item.filterStyle ?? 'none' }}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[#18181B] truncate">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-[#71717A] truncate">
                      {item.subtitle}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#18181B] tabular-nums">
                        {formatMoney(
                          item.priceUSD * item.quantity,
                          item.priceNGN * item.quantity,
                          currency
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.title}`}
                          className="w-6 h-6 rounded-full bg-white border border-zinc-200 inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[12px] font-semibold w-5 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, 1)}
                          aria-label={`Increase quantity of ${item.title}`}
                          className="w-6 h-6 rounded-full bg-white border border-zinc-200 inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="ml-1 text-zinc-400 hover:text-[#DC2626] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!checkoutDone && items.length > 0 && (
          <form
            onSubmit={handleCheckout}
            className="pt-5 mt-6 border-t border-zinc-100 space-y-3"
          >
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-[#71717A]">Subtotal</span>
              <span className="text-[20px] font-bold text-[#18181B] tabular-nums">
                {formatMoney(subtotalUSD, subtotalNGN, currency)}
              </span>
            </div>

            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="WhatsApp / Phone"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="City / Delivery Address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#18181B] text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Complete Gear Checkout
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface OrderModalProps {
  open: boolean;
  bike: Motorcycle | null;
  selectedColor: ColorOption;
  currency: CurrencyCode;
  initialTab?: 'purchase' | 'test-ride';
  appliedPlan?: FinancingPlanSummary | null;
  onClose: () => void;
  onConfirmOrder: (order: OrderRecord) => void;
  onConfirmTestRide: (ride: TestRideRecord) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  open,
  bike,
  selectedColor,
  currency,
  initialTab = 'purchase',
  appliedPlan,
  onClose,
  onConfirmOrder,
  onConfirmTestRide,
}) => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'test-ride'>(
    initialTab
  );

  // Tab 1: Direct Purchase / Reservation state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Benin City');
  const [paymentMethod, setPaymentMethod] = useState<
    'Bank Transfer' | 'Installment Plan' | 'Pay on Inspection'
  >('Bank Transfer');
  const [confirmedOrderRef, setConfirmedOrderRef] = useState<string | null>(
    null
  );

  // Tab 2: Book a Showroom Test Ride state
  const [rideDate, setRideDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [rideShowroom, setRideShowroom] = useState('Benin City Showroom');
  const [riderName, setRiderName] = useState('');
  const [riderWhatsapp, setRiderWhatsapp] = useState('');
  const [hasValidLicense, setHasValidLicense] = useState(false);
  const [confirmedRideRef, setConfirmedRideRef] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmedOrderRef(null);
      setConfirmedRideRef(null);
      setActiveTab(initialTab);
      if (appliedPlan) {
        setActiveTab('purchase');
        setPaymentMethod('Installment Plan');
      }
    }
  }, [open, initialTab, appliedPlan]);

  if (!open || !bike) return null;

  const bikeIsTricycle = isTricycle(bike);
  const totalUSD = bike.priceUSD + selectedColor.surchargeUSD;
  const totalNGN = bike.priceNGN + selectedColor.surchargeNGN;
  const totalFormatted = formatMoney(totalUSD, totalNGN, currency);

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderCode = `OS-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryLabel =
      deliveryCity === 'Showroom Pickup'
        ? 'Showroom Pickup'
        : `Delivery to ${deliveryCity}`;

    const planDetail =
      paymentMethod === 'Installment Plan' && appliedPlan
        ? ` (${appliedPlan.downPaymentPercent}% down · ${appliedPlan.months} mos @ ${formatMoney(
            appliedPlan.monthlyUSD,
            appliedPlan.monthlyNGN,
            currency
          )}/mo)`
        : '';

    onConfirmOrder({
      id: orderCode,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      title: `${bike.brand} ${bike.model}`,
      detail: `${selectedColor.name} · ${deliveryLabel} · ${paymentMethod}${planDetail}`,
      totalFormatted,
      status: 'Pending',
      customerName: fullName.trim(),
      whatsapp: phone.trim(),
      deliveryLocation: deliveryLabel,
      paymentMethod,
      colorName: selectedColor.name,
      quantity: 1,
      totalNGN,
      orderType: bikeIsTricycle ? 'Tricycle' : 'Motorcycle',
    });
    setConfirmedOrderRef(orderCode);
    setFullName('');
    setPhone('');
    setEmail('');
  };

  const handleTestRideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidLicense) return;
    const rideCode = `TR-${Math.floor(100000 + Math.random() * 900000)}`;
    onConfirmTestRide({
      id: rideCode,
      date: rideDate,
      timeSlot,
      showroom: rideShowroom,
      bikeTitle: `${bike.brand} ${bike.model}`,
      riderName,
      whatsapp: riderWhatsapp,
      status: 'Scheduled',
    });
    setConfirmedRideRef(rideCode);
    setRiderName('');
    setRiderWhatsapp('');
    setRideDate('');
    setHasValidLicense(false);
  };

  const cities = [
    'Benin City',
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Showroom Pickup',
  ];

  const paymentMethods: Array<
    'Bank Transfer' | 'Installment Plan' | 'Pay on Inspection'
  > = ['Bank Transfer', 'Installment Plan', 'Pay on Inspection'];

  const timeSlots = ['10:00 AM', '12:00 PM', '02:30 PM', '04:30 PM'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Order and Reservation Modal"
    >
      <div
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden"
          aria-hidden="true"
        />
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[#DC2626]">
              Osas Motorcycle Studio Concierge
            </p>
            <h2 className="mt-0.5 text-[22px] font-bold text-[#18181B]">
              {bike.model}{' '}
              <span className="text-[#DC2626]">{bike.brand}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order modal"
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pre-populated Selected Bike + Swatch + Calculated Total */}
        <div className="mt-4 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F3F3F5]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-20 h-12 shrink-0 flex items-center justify-center">
              <PaintedBikeImage
                src={bike.image}
                colorImages={bike.colorImages}
                selectedColor={selectedColor}
                alt={`${bike.brand} ${bike.model} in ${selectedColor.name}`}
                className="w-full h-full"
                imgClassName={bike.flipProfile ? '-scale-x-100' : ''}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-[#18181B] flex items-center gap-1.5 truncate">
                <span
                  className="w-3 h-3 rounded-full inline-block border border-black/15 shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span className="truncate">{selectedColor.name}</span>
              </div>
              <div className="text-[11.5px] text-[#71717A] tabular-nums">
                {bike.specs.conditionLabel}
                {bikeIsTricycle && bike.fuelType
                  ? ` · Fuel: ${bike.fuelType}`
                  : ''}
                {' · '}
                {bike.specs.engine}
                {selectedColor.surchargeNGN > 0
                  ? ` · +${formatMoney(
                      selectedColor.surchargeUSD,
                      selectedColor.surchargeNGN,
                      currency
                    )}`
                  : ''}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-[#71717A]">Total Price</div>
            <div className="text-[18px] font-bold text-[#18181B] tabular-nums">
              {totalFormatted}
            </div>
          </div>
        </div>

        {/* Two Modal Tabs */}
        <div
          role="tablist"
          aria-label="Reservation Options"
          className="mt-4 grid grid-cols-2 gap-1.5 p-1 rounded-full bg-[#F3F3F5]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'purchase'}
            onClick={() => setActiveTab('purchase')}
            className={`py-2 px-3 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'purchase'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-zinc-600 hover:text-[#18181B]'
            }`}
          >
            Direct Purchase / Reserve
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'test-ride'}
            onClick={() => setActiveTab('test-ride')}
            className={`py-2 px-3 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'test-ride'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-zinc-600 hover:text-[#18181B]'
            }`}
          >
            {bikeIsTricycle
              ? 'Book Showroom Inspection'
              : 'Book a Showroom Test Ride'}
          </button>
        </div>

        {/* Tab 1: Direct Purchase / Reservation */}
        {activeTab === 'purchase' && (
          <>
            {confirmedOrderRef ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="mt-3 text-[12px] font-semibold text-[#DC2626] tabular-nums">
                  Reference #{confirmedOrderRef}
                </p>
                <h3 className="mt-1 text-[20px] font-bold text-[#18181B]">
                  Order Reservation Confirmed
                </h3>
                <p className="mt-2 text-[13.5px] text-[#71717A] max-w-md mx-auto">
                  Your {bike.brand} {bike.model} in{' '}
                  <span className="font-semibold text-[#18181B]">
                    {selectedColor.name}
                  </span>{' '}
                  is reserved under reference{' '}
                  <span className="font-semibold text-[#18181B] tabular-nums">
                    #{confirmedOrderRef}
                  </span>
                  . Our specialist will contact you on WhatsApp shortly.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-7 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-semibold hover:bg-zinc-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePurchaseSubmit} className="mt-4 space-y-3.5">
                {appliedPlan && paymentMethod === 'Installment Plan' && (
                  <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200/70 flex items-center justify-between text-[12.5px]">
                    <span className="text-[#18181B] font-medium">
                      Applied Plan: {appliedPlan.downPaymentPercent}% down ·{' '}
                      {appliedPlan.months} months
                    </span>
                    <span className="font-bold text-[#DC2626] tabular-nums">
                      {formatMoney(
                        appliedPlan.monthlyUSD,
                        appliedPlan.monthlyNGN,
                        currency
                      )}
                      /mo
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone / WhatsApp Number"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                  <select
                    aria-label="Delivery City or Showroom Pickup"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B] cursor-pointer"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city === 'Showroom Pickup'
                          ? 'Showroom Pickup'
                          : `Deliver to ${city}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-[12px] font-semibold text-[#71717A] mb-1.5">
                    Payment Preference
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {paymentMethods.map((method) => {
                      const active = paymentMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`min-h-[44px] sm:min-h-0 py-2 px-2.5 rounded-xl text-[12px] font-medium border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#18181B] text-white border-[#18181B]'
                              : 'bg-white text-[#18181B] border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#18181B] text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {bikeIsTricycle
                    ? `Confirm Tricycle Order · ${totalFormatted}`
                    : `Confirm Order · ${totalFormatted}`}
                </button>
              </form>
            )}
          </>
        )}

        {/* Tab 2: Book a Showroom Test Ride */}
        {activeTab === 'test-ride' && (
          <>
            {confirmedRideRef ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="mt-3 text-[12px] font-semibold text-[#DC2626] tabular-nums">
                  Booking #{confirmedRideRef}
                </p>
                <h3 className="mt-1 text-[20px] font-bold text-[#18181B]">
                  {bikeIsTricycle
                    ? 'Showroom Inspection Confirmed'
                    : 'Showroom Test Ride Confirmed'}
                </h3>
                <p className="mt-2 text-[13.5px] text-[#71717A] max-w-md mx-auto">
                  Your {bike.brand} {bike.model} will be prepped and ready for
                  inspection at our {rideShowroom}. Please bring a valid ID
                  {bikeIsTricycle ? ' or operator license' : " and rider's license"}
                  .
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-7 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-semibold hover:bg-zinc-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleTestRideSubmit} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    placeholder="Rider Full Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                  <input
                    type="tel"
                    required
                    value={riderWhatsapp}
                    onChange={(e) => setRiderWhatsapp(e.target.value)}
                    placeholder="WhatsApp Number"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#71717A] mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={rideDate}
                      onChange={(e) => setRideDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#71717A] mb-1">
                      Showroom Location
                    </label>
                    <select
                      value={rideShowroom}
                      onChange={(e) => setRideShowroom(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B] cursor-pointer"
                    >
                      <option value="Benin City Showroom">
                        Benin City Showroom
                      </option>
                      <option value="Lagos Victoria Island Showroom">
                        Lagos Victoria Island Showroom
                      </option>
                      <option value="Abuja Maitama Showroom">
                        Abuja Maitama Showroom
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#71717A] mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Preferred Time Slot
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`min-h-[44px] sm:min-h-0 py-2 px-2 rounded-xl text-[12px] font-medium border transition-colors cursor-pointer tabular-nums ${
                          timeSlot === slot
                            ? 'bg-[#18181B] text-white border-[#18181B]'
                            : 'bg-white text-[#18181B] border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F3F3F5] cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={hasValidLicense}
                    onChange={(e) => setHasValidLicense(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#DC2626] rounded cursor-pointer"
                  />
                  <span className="text-[12.5px] text-[#52525B] leading-snug">
                    {bikeIsTricycle
                      ? 'I confirm I hold a valid operator / driver license and will present it at the showroom prior to inspection.'
                      : "I confirm I hold a valid motorcycle rider's license and will present it at the showroom prior to my test ride."}
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#18181B] text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {bikeIsTricycle
                    ? 'Confirm Showroom Inspection'
                    : 'Confirm Test Ride Booking'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface FinancingEstimatorModalProps {
  open: boolean;
  motorcycles?: Motorcycle[];
  activeBike: Motorcycle;
  selectedColor: ColorOption;
  currency: CurrencyCode;
  interestRatePercent?: number;
  defaultDownPaymentPercent?: number;
  onToggleCurrency: (currency: CurrencyCode) => void;
  onClose: () => void;
  onApplyPlan: (bike: Motorcycle, plan: FinancingPlanSummary) => void;
  onBrowseStockByPrice: () => void;
}

export const FinancingEstimatorModal: React.FC<
  FinancingEstimatorModalProps
> = ({
  open,
  motorcycles = MOTORCYCLES,
  activeBike,
  selectedColor,
  currency,
  interestRatePercent = 6.5,
  defaultDownPaymentPercent = 30,
  onToggleCurrency,
  onClose,
  onApplyPlan,
  onBrowseStockByPrice,
}) => {
  const [selectedBikeId, setSelectedBikeId] = useState(activeBike.id);
  const [downPaymentPercent, setDownPaymentPercent] = useState(
    defaultDownPaymentPercent
  );
  const [months, setMonths] = useState<6 | 12 | 18 | 24 | 36>(18);

  useEffect(() => {
    if (open) {
      setSelectedBikeId(activeBike.id);
      setDownPaymentPercent(defaultDownPaymentPercent);
    }
  }, [open, activeBike.id, defaultDownPaymentPercent]);

  const targetBike = useMemo(
    () => motorcycles.find((b) => b.id === selectedBikeId) ?? activeBike,
    [motorcycles, selectedBikeId, activeBike]
  );

  const surchargeUSD =
    targetBike.id === activeBike.id ? selectedColor.surchargeUSD : 0;
  const surchargeNGN =
    targetBike.id === activeBike.id ? selectedColor.surchargeNGN : 0;

  const totalUSD = targetBike.priceUSD + surchargeUSD;
  const totalNGN = targetBike.priceNGN + surchargeNGN;

  const downPaymentUSD = (totalUSD * downPaymentPercent) / 100;
  const downPaymentNGN = (totalNGN * downPaymentPercent) / 100;

  const annualRate = Math.max(0, interestRatePercent) / 100;
  const principalUSD = totalUSD - downPaymentUSD;
  const principalNGN = totalNGN - downPaymentNGN;
  const factor = 1 + annualRate * (months / 12);

  const monthlyUSD = (principalUSD * factor) / months;
  const monthlyNGN = (principalNGN * factor) / months;

  if (!open) return null;

  const durations: Array<6 | 12 | 18 | 24 | 36> = [6, 12, 18, 24, 36];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Osas Motorcycle Financing Estimator"
    >
      <div
        className="w-full max-w-2xl bg-[#F3F3F5] rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/80 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden"
          aria-hidden="true"
        />
        {/* Top Bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#DC2626]">
              <Calculator className="w-3.5 h-3.5" />
              <span>Osas Motorcycle Financing Estimator</span>
            </div>
            <h2 className="mt-0.5 text-[22px] sm:text-[26px] font-bold tracking-tight text-[#18181B]">
              Tailored Monthly Ownership Plan
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center rounded-full bg-white p-1 shadow-xs border border-black/[0.05]">
              {(['NGN', 'USD'] as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onToggleCurrency(code)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                    currency === code
                      ? 'bg-[#18181B] text-white'
                      : 'text-zinc-600 hover:text-[#18181B]'
                  }`}
                >
                  {code === 'NGN' ? '₦ NGN' : '$ USD'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close financing estimator"
              className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 inline-flex items-center justify-center text-[#18181B] shadow-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* White Bento Estimator Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Controls Card */}
          <div className="md:col-span-7 bg-white rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-black/[0.03] space-y-5">
            {/* Bike Selector */}
            <div>
              <label
                htmlFor="financing-bike-select"
                className="block text-[12px] font-semibold text-[#71717A] mb-1.5"
              >
                Selected Vehicle (Motorcycle or Tricycle)
              </label>
              <select
                id="financing-bike-select"
                value={targetBike.id}
                onChange={(e) => setSelectedBikeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F3F5] text-[13.5px] font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B] cursor-pointer"
              >
                {motorcycles.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {isTricycle(bike) ? '[Tricycle] ' : ''}
                    {bike.brand} {bike.model} —{' '}
                    {formatMoney(bike.priceUSD, bike.priceNGN, currency)}
                  </option>
                ))}
              </select>
              {isTricycle(targetBike) && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                  Commercial Keke &amp; Cargo Fleet Plan · {targetBike.fuelType || 'Petrol'}
                </div>
              )}
            </div>

            {/* Down Payment Slider */}
            <div>
              <div className="flex items-center justify-between text-[13px] mb-2">
                <span className="font-semibold text-[#18181B]">
                  Down Payment ({downPaymentPercent}%)
                </span>
                <span className="font-bold text-[#18181B] tabular-nums">
                  {formatMoney(downPaymentUSD, downPaymentNGN, currency)}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                aria-label="Down payment percentage"
                className="w-full accent-[#DC2626] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#71717A] mt-1 tabular-nums">
                <span>20% min</span>
                <span>45%</span>
                <span>70% max</span>
              </div>
            </div>

            {/* Repayment Duration Pill Selector */}
            <div>
              <div className="text-[13px] font-semibold text-[#18181B] mb-2">
                Repayment Duration
              </div>
              <div className="flex flex-wrap gap-2">
                {durations.map((m) => {
                  const active = months === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonths(m)}
                      className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-colors cursor-pointer tabular-nums ${
                        active
                          ? 'bg-[#18181B] text-white'
                          : 'bg-[#F3F3F5] text-[#18181B] hover:bg-zinc-200/80'
                      }`}
                    >
                      {m} mos
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="md:col-span-5 bg-white rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-black/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center bg-[#F3F3F5] rounded-2xl p-3 mb-4 h-28">
                <PaintedBikeImage
                  src={targetBike.image}
                  colorImages={targetBike.colorImages}
                  selectedColor={
                    targetBike.id === activeBike.id
                      ? selectedColor
                      : (targetBike.colorOptions ?? COLOR_OPTIONS).find(
                          (c) => c.id === targetBike.defaultColorId
                        ) ?? selectedColor
                  }
                  alt={`${targetBike.brand} ${targetBike.model}`}
                  className="w-full h-full"
                  imgClassName={targetBike.flipProfile ? '-scale-x-100' : ''}
                />
              </div>

              <div className="text-[12px] text-[#71717A]">
                Estimated Monthly Payment
              </div>
              <div className="mt-1 text-[28px] sm:text-[32px] font-bold tracking-tight text-[#18181B] tabular-nums leading-none">
                {formatMoney(monthlyUSD, monthlyNGN, currency)}
                <span className="text-[13px] font-medium text-[#71717A]">
                  /mo
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-[12px]">
                <div className="flex justify-between text-[#71717A]">
                  <span>Vehicle Total</span>
                  <span className="font-semibold text-[#18181B] tabular-nums">
                    {formatMoney(totalUSD, totalNGN, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>Financed Balance</span>
                  <span className="font-semibold text-[#18181B] tabular-nums">
                    {formatMoney(principalUSD, principalNGN, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>Term</span>
                  <span className="font-semibold text-[#18181B] tabular-nums">
                    {months} Months · 6.5% APR
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() =>
                  onApplyPlan(targetBike, {
                    bikeId: targetBike.id,
                    downPaymentPercent,
                    months,
                    monthlyUSD,
                    monthlyNGN,
                    downPaymentUSD,
                    downPaymentNGN,
                  })
                }
                className="w-full py-3 rounded-full bg-[#18181B] text-white text-[13.5px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Apply with This Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBrowseStockByPrice();
                }}
                className="w-full py-2 text-[12px] font-medium text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                Or sort full stock by price
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  savedBikes: Motorcycle[];
  orders: OrderRecord[];
  testRides: TestRideRecord[];
  tradeIns: TradeInRecord[];
  currency: CurrencyCode;
  onToggleCurrency: (c: CurrencyCode) => void;
  onSelectSavedBike: (bikeId: string) => void;
  authUser?: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  } | null;
  onSignInGoogle?: () => void;
  onSignOut?: () => void;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  open,
  onClose,
  savedBikes,
  orders,
  testRides,
  tradeIns,
  currency,
  onToggleCurrency,
  onSelectSavedBike,
  authUser,
  onSignInGoogle,
  onSignOut,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Account and Saved Garage"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-[18px] font-bold text-[#18181B]">
                Rider Garage &amp; Activity
              </h2>
              <p className="text-[12px] text-[#71717A]">
                {authUser
                  ? `Synced to cloud · ${authUser.email || authUser.displayName}`
                  : 'Sign in with Google to sync across devices'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close garage drawer"
              className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cloud Account Sync */}
          {(onSignInGoogle || authUser) && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F3F3F5]">
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-[#18181B] truncate">
                  {authUser
                    ? authUser.displayName || authUser.email || 'Signed In'
                    : 'Cloud Garage Sync'}
                </div>
                <div className="text-[11px] text-[#71717A] truncate">
                  {authUser
                    ? 'Orders, test rides & saved bikes synced'
                    : 'Save orders & bikes to your account'}
                </div>
              </div>
              {authUser ? (
                onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-[11.5px] font-semibold text-[#18181B] border border-black/[0.06] shrink-0 cursor-pointer"
                  >
                    Sign Out
                  </button>
                )
              ) : (
                onSignInGoogle && (
                  <button
                    type="button"
                    onClick={onSignInGoogle}
                    className="px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-[11.5px] font-semibold text-white shrink-0 transition-colors cursor-pointer"
                  >
                    Sign in with Google
                  </button>
                )
              )}
            </div>
          )}

          {/* Currency Preference */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F3F3F5]">
            <span className="text-[13px] font-medium text-[#18181B]">
              Display Currency
            </span>
            <div className="inline-flex rounded-full bg-white p-0.5 border border-black/[0.05]">
              {(['NGN', 'USD'] as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onToggleCurrency(code)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
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

          {/* Saved Garage */}
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#DC2626]" />
              Saved Garage ({savedBikes.length})
            </h3>
            {savedBikes.length === 0 ? (
              <p className="mt-2 text-[13px] text-[#71717A]">
                Tap the heart icon on any motorcycle in the showroom stock to
                save it here.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {savedBikes.map((bike) => (
                  <button
                    key={bike.id}
                    type="button"
                    onClick={() => {
                      onSelectSavedBike(bike.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F3F3F5] hover:bg-zinc-200/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StudioImage
                        src={bike.image}
                        alt={bike.model}
                        loading="lazy"
                        fallbackType="bike"
                        className="w-16 h-10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold text-[#18181B] truncate">
                          {bike.model}{' '}
                          <span className="text-[#DC2626]">{bike.brand}</span>
                        </div>
                        <div className="text-[12px] text-[#71717A] tabular-nums">
                          {formatMoney(bike.priceUSD, bike.priceNGN, currency)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#18181B] shrink-0">
                      Load
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B]">
              Orders & Reservations ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <p className="mt-2 text-[13px] text-[#71717A]">
                No motorcycle or gear orders placed yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-[#F3F3F5] border border-black/[0.04]"
                  >
                    <div className="flex items-center justify-between text-[12px] text-[#71717A]">
                      <span className="font-semibold text-[#18181B] tabular-nums">
                        #{order.id}
                      </span>
                      <span>{order.date}</span>
                    </div>
                    <div className="mt-1 text-[13.5px] font-semibold text-[#18181B]">
                      {order.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#71717A]">
                      {order.detail}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px]">
                      <span className="font-medium text-emerald-700">
                        {order.status}
                      </span>
                      <span className="font-bold text-[#18181B] tabular-nums">
                        {order.totalFormatted}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Ride Bookings */}
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#18181B]" />
              Showroom Test Rides ({testRides.length})
            </h3>
            {testRides.length === 0 ? (
              <p className="mt-2 text-[13px] text-[#71717A]">
                No test rides booked yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {testRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="p-3.5 rounded-2xl bg-[#F3F3F5] border border-black/[0.04]"
                  >
                    <div className="flex items-center justify-between text-[12px] text-[#71717A]">
                      <span className="font-semibold text-[#18181B] tabular-nums">
                        #{ride.id}
                      </span>
                      <span>
                        {ride.date} · {ride.timeSlot}
                      </span>
                    </div>
                    <div className="mt-1 text-[13.5px] font-semibold text-[#18181B]">
                      {ride.bikeTitle}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#71717A]">
                      {ride.showroom} · {ride.riderName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trade-In Valuations */}
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#DC2626]" />
              Trade-In Valuations ({tradeIns.length})
            </h3>
            {tradeIns.length === 0 ? (
              <p className="mt-2 text-[13px] text-[#71717A]">
                No trade-in appraisals submitted yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {tradeIns.map((ti) => (
                  <div
                    key={ti.id}
                    className="p-3.5 rounded-2xl bg-[#F3F3F5] border border-black/[0.04]"
                  >
                    <div className="flex items-center justify-between text-[12px] text-[#71717A]">
                      <span className="font-semibold text-[#18181B] tabular-nums">
                        #{ti.id}
                      </span>
                      <span>{ti.submittedAt}</span>
                    </div>
                    <div className="mt-1 text-[13.5px] font-semibold text-[#18181B]">
                      {ti.year} {ti.brand} {ti.model}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#71717A]">
                      {ti.mileage} km · {ti.condition} → Toward {ti.targetBike}
                    </div>
                    <div className="mt-1.5 text-[12px] font-bold text-[#DC2626] tabular-nums">
                      Est. Trade Credit: {ti.estimatedRange}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InquiryModalProps {
  open: boolean;
  title: string;
  topic: 'service' | 'experience';
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  open,
  title,
  topic,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setContact('');
    setPreferredDate('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[#DC2626]">
              {topic === 'service'
                ? 'Osas Certified Atelier'
                : 'Private Showroom & Track'}
            </p>
            <h2 className="mt-0.5 text-[20px] font-bold text-[#18181B]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-[18px] font-bold text-[#18181B]">
              Request Scheduled
            </h3>
            <p className="mt-1.5 text-[13.5px] text-[#71717A]">
              Our showroom concierge will confirm your exact slot shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
            />
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone / WhatsApp or Email"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
            />
            <input
              type="date"
              required
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#18181B] text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Confirm Appointment
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
