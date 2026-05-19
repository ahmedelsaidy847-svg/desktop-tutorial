import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { salesOrders, tripsForOrder1 } from '../data/mock';
import { DumpDivertModal } from './DumpDivertModal';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: 'مؤكد', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  IN_DELIVERY: { label: 'قيد التسليم', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  COMPLETED: { label: 'مكتمل', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'ملغي', cls: 'bg-red-100 text-red-800 border-red-200' },
  DIVERTED: { label: 'محوّل', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const TRIP_STATUS: Record<string, { label: string; cls: string }> = {
  LOADED: { label: 'محمّل', cls: 'bg-blue-100 text-blue-700' },
  IN_TRANSIT: { label: 'في الطريق', cls: 'bg-amber-100 text-amber-700' },
  ARRIVED: { label: 'وصل', cls: 'bg-purple-100 text-purple-700' },
  POURING: { label: 'جاري الصب', cls: 'bg-orange-100 text-orange-700' },
  COMPLETED: { label: 'مكتمل', cls: 'bg-emerald-100 text-emerald-700' },
};

const SECTIONS = [
  { id: 'details', title: 'بيانات الأمر', icon: '▦' },
  { id: 'quantities', title: 'الكميات والتقدّم', icon: '▤' },
  { id: 'trips', title: 'رحلات التوصيل', icon: '▷' },
  { id: 'financials', title: 'المعلومات المالية', icon: '◈' },
];

interface Props {
  orderId: string;
  onBack: () => void;
}

export function SalesOrderDetail({ orderId, onBack }: Props) {
  const order = salesOrders.find((o) => o.id === orderId) ?? salesOrders[0];
  const trips = order.id === '1' ? tripsForOrder1 : tripsForOrder1.slice(0, 3);

  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('details');
  const [divertTrip, setDivertTrip] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setCollapsed(el.scrollTop > 60);
      let current = 'details';
      for (const s of SECTIONS) {
        const ref = sectionRefs.current[s.id];
        if (ref && ref.offsetTop - 160 <= el.scrollTop) current = s.id;
      }
      setActiveSection(current);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const ref = sectionRefs.current[id];
    if (ref && scrollRef.current) {
      scrollRef.current.scrollTo({ top: ref.offsetTop - 130, behavior: 'smooth' });
    }
  };

  const st = STATUS_MAP[order.status];
  const deliveredPct = (order.deliveredQtyM3 / order.orderedQtyM3) * 100;
  const remaining = order.orderedQtyM3 - order.deliveredQtyM3;

  return (
    <div className="h-full flex flex-col bg-fiori-bg-page">
      {/* ===== Dynamic Page Header ===== */}
      <div
        className={clsx(
          'bg-white border-b border-fiori-border shadow-sm transition-all duration-300',
          collapsed ? 'py-2' : 'py-4'
        )}
      >
        {!collapsed && (
          <div className="px-6 mb-2 flex items-center gap-1 text-xs text-fiori-text-sec">
            <button onClick={onBack} className="hover:text-fiori-brand transition-colors">
              الرئيسية
            </button>
            <span className="text-fiori-text-dis">/</span>
            <button onClick={onBack} className="hover:text-fiori-brand transition-colors">
              أوامر البيع
            </button>
            <span className="text-fiori-text-dis">/</span>
            <span className="text-fiori-text">{order.orderNumber}</span>
          </div>
        )}

        <div className="px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={onBack}
                  className="w-7 h-7 rounded hover:bg-fiori-bg-page flex items-center justify-center text-fiori-text-sec shrink-0"
                >
                  →
                </button>
                <h1
                  className={clsx(
                    'font-bold text-fiori-text transition-all duration-300',
                    collapsed ? 'text-lg' : 'text-2xl'
                  )}
                >
                  أمر بيع — {order.orderNumber}
                </h1>
                <span
                  className={clsx(
                    'px-3 py-0.5 rounded-full text-xs font-medium border',
                    st.cls
                  )}
                >
                  {st.label}
                </span>
              </div>

              {!collapsed && (
                <>
                  <p className="mt-1 mr-10 text-sm text-fiori-text-sec">
                    {order.customer.bpNameAr}
                  </p>
                  <div className="mt-2 mr-10 flex items-baseline gap-1.5">
                    <span className="text-3xl font-light text-fiori-text tabular-nums">
                      {order.orderedQtyM3}
                    </span>
                    <span className="text-sm text-fiori-text-sec">م³ مطلوب</span>
                  </div>
                  <div className="mt-3 mr-10 flex flex-wrap gap-x-6 gap-y-1">
                    <Attr label="المحطة" value={order.plant.plantNameAr} />
                    <Attr label="تاريخ التسليم" value={order.deliveryDate} />
                    <Attr label="الخلطة" value={order.mixDesign.concretGrade} />
                    <Attr label="نوع الصبة" value={order.pourType} />
                  </div>
                </>
              )}
            </div>

            {/* Actions — read/edit toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded text-sm font-medium bg-white border border-fiori-text-dis text-fiori-text hover:bg-fiori-bg-page transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded text-sm font-medium bg-fiori-brand text-white hover:bg-fiori-brand-dk transition-colors"
                  >
                    حفظ
                  </button>
                </>
              ) : (
                <>
                  <button className="px-4 py-2 rounded text-sm font-medium bg-white border border-fiori-text-dis text-fiori-text hover:bg-fiori-bg-page transition-colors">
                    إصدار فاتورة
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded text-sm font-medium bg-fiori-brand text-white hover:bg-fiori-brand-dk transition-colors"
                  >
                    تعديل
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Anchor Navigation ===== */}
      <div className="bg-white border-b border-fiori-border shadow-sm">
        <div className="px-6 flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeSection === s.id
                  ? 'border-fiori-brand text-fiori-brand'
                  : 'border-transparent text-fiori-text-sec hover:text-fiori-text'
              )}
            >
              <span>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Scrollable Content ===== */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-4 space-y-4">
          {/* Section: Details */}
          <Section
            id="details"
            title="بيانات الأمر"
            icon="▦"
            refCb={(el) => (sectionRefs.current['details'] = el)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="العميل" value={order.customer.bpNameAr} editing={isEditing} />
              <Field label="رمز العميل" value={order.customer.bpCode} />
              <Field label="المحطة" value={order.plant.plantNameAr} editing={isEditing} />
              <Field
                label="تصميم الخلطة"
                value={`${order.mixDesign.designCode} — ${order.mixDesign.concretGrade}`}
              />
              <Field label="تاريخ التسليم" value={order.deliveryDate} editing={isEditing} />
              <Field label="نوع الصبة" value={order.pourType} editing={isEditing} />
              <Field
                label="استخدام مضخة"
                value={
                  order.pumpRequired
                    ? `نعم — ${order.pumpType} (${order.pumpLengthM} م)`
                    : 'لا'
                }
                editing={isEditing}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="عنوان التسليم" value={order.deliveryAddress} editing={isEditing} />
              </div>
            </div>
          </Section>

          {/* Section: Quantities */}
          <Section
            id="quantities"
            title="الكميات والتقدّم"
            icon="▤"
            refCb={(el) => (sectionRefs.current['quantities'] = el)}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <Kpi label="المطلوب" value={`${order.orderedQtyM3} م³`} variant="neutral" />
              <Kpi label="المسلّم" value={`${order.deliveredQtyM3} م³`} variant="success" />
              <Kpi label="المتبقي" value={`${remaining.toFixed(1)} م³`} variant="warning" />
              <Kpi
                label="نسبة التسليم"
                value={`${deliveredPct.toFixed(0)}%`}
                variant={deliveredPct >= 100 ? 'success' : 'info'}
              />
            </div>
            <div className="h-3 bg-fiori-bg-page rounded-full overflow-hidden">
              <div
                className="h-full bg-fiori-brand rounded-full transition-all duration-700"
                style={{ width: `${Math.min(deliveredPct, 100)}%` }}
              />
            </div>
          </Section>

          {/* Section: Trips */}
          <Section
            id="trips"
            title={`رحلات التوصيل (${trips.length})`}
            icon="▷"
            refCb={(el) => (sectionRefs.current['trips'] = el)}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-fiori-text-sec border-b border-fiori-border">
                    <th className="py-2 px-3 font-semibold text-right">رقم الرحلة</th>
                    <th className="py-2 px-3 font-semibold text-right">الشاحنة</th>
                    <th className="py-2 px-3 font-semibold text-right">السائق</th>
                    <th className="py-2 px-3 font-semibold text-left">محمّل</th>
                    <th className="py-2 px-3 font-semibold text-left">مسلّم</th>
                    <th className="py-2 px-3 font-semibold text-left">عمولة</th>
                    <th className="py-2 px-3 font-semibold text-right">الحالة</th>
                    <th className="py-2 px-3 font-semibold text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fiori-border">
                  {trips.map((t) => {
                    const ts = TRIP_STATUS[t.status];
                    const canDivert = ['LOADED', 'IN_TRANSIT', 'ARRIVED'].includes(t.status);
                    return (
                      <tr key={t.id} className="hover:bg-fiori-bg-page transition-colors">
                        <td className="py-2.5 px-3 font-medium text-fiori-brand">
                          {t.tripNumber}
                        </td>
                        <td className="py-2.5 px-3">{t.vehicle.vehicleNumber}</td>
                        <td className="py-2.5 px-3">{t.driver.fullNameAr}</td>
                        <td className="py-2.5 px-3 text-left tabular-nums">{t.loadedQtyM3}</td>
                        <td className="py-2.5 px-3 text-left tabular-nums">
                          {t.deliveredQtyM3 ?? '—'}
                        </td>
                        <td className="py-2.5 px-3 text-left tabular-nums text-fiori-text-sec">
                          {t.driverCommissionAmount ? `${t.driverCommissionAmount} ر` : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              ts.cls
                            )}
                          >
                            {ts.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {canDivert ? (
                            <button
                              onClick={() => setDivertTrip(t.id)}
                              className="text-xs px-2.5 py-1 border border-amber-400 text-amber-700 rounded hover:bg-amber-50 transition-colors"
                            >
                              تحويل
                            </button>
                          ) : (
                            <span className="text-fiori-text-dis text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section: Financials */}
          <Section
            id="financials"
            title="المعلومات المالية"
            icon="◈"
            refCb={(el) => (sectionRefs.current['financials'] = el)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <Kpi
                label="سعر الوحدة"
                value={`${order.unitPrice} ر/م³`}
                variant="neutral"
              />
              <Kpi
                label="إجمالي الفاتورة"
                value={`${order.totalAmount.toLocaleString('en-US')} ر`}
                variant="info"
              />
              <Kpi
                label="حالة الفاتورة"
                value={order.arInvoice ? 'صادرة جزئياً' : 'لم تصدر'}
                variant={order.arInvoice ? 'success' : 'warning'}
              />
            </div>
            {order.arInvoice && (
              <div className="bg-fiori-bg-page rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-fiori-text-sec">رقم الفاتورة الإلكترونية</div>
                  <div className="text-sm font-medium text-fiori-brand mt-0.5">
                    {order.arInvoice.invoiceNumber}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-fiori-text-sec">القيمة شاملة الضريبة</div>
                  <div className="text-sm font-semibold text-fiori-text mt-0.5 tabular-nums">
                    {order.arInvoice.totalAmount.toLocaleString('en-US')} ريال
                  </div>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>

      {divertTrip && (
        <DumpDivertModal
          tripNumber={trips.find((t) => t.id === divertTrip)?.tripNumber ?? ''}
          onClose={() => setDivertTrip(null)}
        />
      )}
    </div>
  );
}

function Attr({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-fiori-text-sec">{label}:</span>
      <span className="text-sm font-medium text-fiori-text">{value ?? '—'}</span>
    </div>
  );
}

function Section({
  id, title, icon, children, refCb,
}: {
  id: string; title: string; icon: string;
  children: React.ReactNode;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      id={id}
      ref={refCb}
      className="bg-white rounded-lg border border-fiori-border shadow-sm overflow-hidden"
    >
      <div className="px-6 py-3.5 border-b border-fiori-border bg-fiori-bg-page">
        <h2 className="text-base font-semibold text-fiori-text flex items-center gap-2">
          <span className="text-fiori-brand">{icon}</span>
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label, value, editing,
}: {
  label: string; value: string; editing?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-fiori-text-sec">{label}</span>
      {editing ? (
        <input
          defaultValue={value}
          className="px-2.5 py-1.5 text-sm border border-fiori-brand rounded bg-fiori-brand-lt/40 focus:outline-none focus:ring-2 focus:ring-fiori-brand"
        />
      ) : (
        <span className="text-sm text-fiori-text">{value || '—'}</span>
      )}
    </div>
  );
}

function Kpi({
  label, value, variant,
}: {
  label: string; value: string;
  variant: 'success' | 'warning' | 'info' | 'neutral';
}) {
  const colors = {
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
    neutral: 'bg-fiori-bg-page border-fiori-border',
  };
  return (
    <div className={clsx('rounded-lg border p-4 flex flex-col gap-1', colors[variant])}>
      <span className="text-xs text-fiori-text-sec">{label}</span>
      <span className="text-lg font-semibold text-fiori-text tabular-nums">{value}</span>
    </div>
  );
}
