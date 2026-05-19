import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ObjectPage from '../../components/fiori/ObjectPage/ObjectPage';
import { DumpDivertModal } from './DumpDivertModal';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: { bpNameAr: string; bpCode: string };
  plant: { plantNameAr: string };
  mixDesign: { designCode: string; concretGrade: string };
  orderedQtyM3: number;
  deliveredQtyM3: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  deliveryDate: string;
  deliveryAddress: string;
  pumpRequired: boolean;
  pumpType?: string;
  pumpLengthM?: number;
  pourType?: string;
  deliveryTrips: DeliveryTrip[];
  arInvoice?: { invoiceNumber: string; totalAmount: number; status: string };
}

interface DeliveryTrip {
  id: string;
  tripNumber: string;
  vehicle: { vehicleNumber: string };
  driver: { fullNameAr: string };
  loadedQtyM3: number;
  deliveredQtyM3?: number;
  status: string;
  loadTime: string;
  driverCommissionAmount?: number;
}

async function fetchSalesOrder(id: string): Promise<SalesOrder> {
  const res = await fetch(`/api/sales-orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [divertTripId, setDivertTripId] = useState<string | null>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ['sales-order', id],
    queryFn: () => fetchSalesOrder(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SalesOrder>) => {
      const res = await fetch(`/api/sales-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-order', id] });
      setIsEditing(false);
    },
  });

  const STATUS_LABELS: Record<string, string> = {
    CONFIRMED: 'مؤكد',
    IN_DELIVERY: 'قيد التسليم',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
    DIVERTED: 'محول',
  };

  const STATUS_VARIANTS: Record<
    string,
    'success' | 'warning' | 'error' | 'info' | 'neutral'
  > = {
    CONFIRMED: 'info',
    IN_DELIVERY: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
    DIVERTED: 'neutral',
  };

  const deliveredPct = order
    ? (order.deliveredQtyM3 / order.orderedQtyM3) * 100
    : 0;

  const sections = [
    {
      id: 'details',
      title: 'بيانات الأمر',
      icon: <DocumentIcon />,
      content: order ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="العميل" value={order.customer.bpNameAr} />
          <FormField label="رمز العميل" value={order.customer.bpCode} />
          <FormField label="المحطة" value={order.plant.plantNameAr} />
          <FormField label="تصميم الخلطة" value={`${order.mixDesign.designCode} - ${order.mixDesign.concretGrade}`} />
          <FormField label="تاريخ التسليم" value={new Date(order.deliveryDate).toLocaleDateString('ar-SA')} />
          <FormField label="نوع الصبة" value={order.pourType ?? '-'} />
          <FormField
            label="استخدام مضخة"
            value={order.pumpRequired ? `نعم - ${order.pumpType ?? ''} (${order.pumpLengthM ?? 0} م)` : 'لا'}
          />
          <FormField label="عنوان التسليم" value={order.deliveryAddress} span={2} />
        </div>
      ) : null,
    },
    {
      id: 'quantities',
      title: 'الكميات والتسعير',
      icon: <ChartIcon />,
      content: order ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPICard
              label="المطلوب"
              value={`${order.orderedQtyM3} م³`}
              variant="neutral"
            />
            <KPICard
              label="المسلّم"
              value={`${order.deliveredQtyM3} م³`}
              variant="success"
            />
            <KPICard
              label="المتبقي"
              value={`${(order.orderedQtyM3 - order.deliveredQtyM3).toFixed(1)} م³`}
              variant="warning"
            />
            <KPICard
              label="نسبة التسليم"
              value={`${deliveredPct.toFixed(0)}%`}
              variant={deliveredPct >= 100 ? 'success' : 'info'}
            />
          </div>
          <div className="h-3 bg-[#F5F6F7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0070F2] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(deliveredPct, 100)}%` }}
            />
          </div>
        </div>
      ) : null,
    },
    {
      id: 'trips',
      title: `رحلات التوصيل (${order?.deliveryTrips?.length ?? 0})`,
      icon: <TruckIcon />,
      content: (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#6E8091] border-b border-[#DFE3E8] text-right">
                <th className="py-2 px-3 font-semibold">رقم الرحلة</th>
                <th className="py-2 px-3 font-semibold">الشاحنة</th>
                <th className="py-2 px-3 font-semibold">السائق</th>
                <th className="py-2 px-3 font-semibold">محمل (م³)</th>
                <th className="py-2 px-3 font-semibold">مسلّم (م³)</th>
                <th className="py-2 px-3 font-semibold">الحالة</th>
                <th className="py-2 px-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE3E8]">
              {order?.deliveryTrips?.map((trip) => (
                <tr key={trip.id} className="hover:bg-[#F5F6F7]">
                  <td className="py-3 px-3 font-mono text-[#0070F2]">
                    {trip.tripNumber}
                  </td>
                  <td className="py-3 px-3">{trip.vehicle.vehicleNumber}</td>
                  <td className="py-3 px-3">{trip.driver.fullNameAr}</td>
                  <td className="py-3 px-3 font-mono">{trip.loadedQtyM3}</td>
                  <td className="py-3 px-3 font-mono">
                    {trip.deliveredQtyM3 ?? '-'}
                  </td>
                  <td className="py-3 px-3">
                    <TripStatusBadge status={trip.status} />
                  </td>
                  <td className="py-3 px-3">
                    {['LOADED', 'IN_TRANSIT', 'ARRIVED'].includes(
                      trip.status
                    ) && (
                      <button
                        onClick={() => setDivertTripId(trip.id)}
                        className="text-xs px-2 py-1 border border-amber-400 text-amber-700 rounded hover:bg-amber-50 transition-colors"
                      >
                        تحويل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'financials',
      title: 'المعلومات المالية',
      icon: <FinanceIcon />,
      content: order ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            label="سعر الوحدة"
            value={`${order.unitPrice.toLocaleString('ar-SA')} ريال/م³`}
            variant="neutral"
          />
          <KPICard
            label="إجمالي الفاتورة"
            value={`${order.totalAmount.toLocaleString('ar-SA')} ريال`}
            variant="info"
          />
          <KPICard
            label="حالة الفاتورة"
            value={order.arInvoice?.status ?? 'لم تصدر'}
            variant={order.arInvoice ? 'success' : 'warning'}
          />
        </div>
      ) : null,
    },
  ];

  return (
    <>
      <ObjectPage
        title={order ? `أمر بيع - ${order.orderNumber}` : 'جاري التحميل...'}
        subtitle={order?.customer.bpNameAr}
        objectNumber={
          order ? String(order.orderedQtyM3) : undefined
        }
        objectNumberUnit="م³ مطلوب"
        status={
          order
            ? {
                label: STATUS_LABELS[order.status] ?? order.status,
                variant:
                  STATUS_VARIANTS[order.status] ?? 'neutral',
              }
            : undefined
        }
        headerAttributes={
          order
            ? [
                { label: 'المحطة', value: order.plant.plantNameAr },
                {
                  label: 'تاريخ التسليم',
                  value: new Date(order.deliveryDate).toLocaleDateString('ar-SA'),
                },
                { label: 'الخلطة', value: order.mixDesign.concretGrade },
              ]
            : []
        }
        sections={sections}
        actions={[
          {
            key: 'invoice',
            label: 'إصدار فاتورة',
            variant: 'secondary',
            disabled: !!order?.arInvoice,
            onClick: () => {},
          },
          {
            key: 'cancel',
            label: 'إلغاء الأمر',
            variant: 'danger',
            disabled: order?.status === 'CANCELLED',
            onClick: () => {},
          },
        ]}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={async () => {
          await updateMutation.mutateAsync({});
        }}
        onCancel={() => setIsEditing(false)}
        isLoading={isLoading}
        breadcrumbs={[
          { label: 'الرئيسية', href: '/' },
          { label: 'أوامر البيع', href: '/sales-orders' },
          { label: order?.orderNumber ?? '...' },
        ]}
      />

      {divertTripId && (
        <DumpDivertModal
          tripId={divertTripId}
          onClose={() => setDivertTripId(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['sales-order', id] });
            setDivertTripId(null);
          }}
        />
      )}
    </>
  );
}

function FormField({
  label,
  value,
  span = 1,
}: {
  label: string;
  value: string;
  span?: number;
}) {
  return (
    <div
      className={clsx('flex flex-col gap-1', span === 2 && 'sm:col-span-2')}
    >
      <span className="text-xs font-medium text-[#6E8091]">{label}</span>
      <span className="text-sm text-[#32363A]">{value || '-'}</span>
    </div>
  );
}

import { clsx } from 'clsx';

function KPICard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: 'success' | 'warning' | 'info' | 'error' | 'neutral';
}) {
  const colors = {
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
    error: 'bg-red-50 border-red-200',
    neutral: 'bg-[#F5F6F7] border-[#DFE3E8]',
  };
  return (
    <div
      className={clsx(
        'rounded-lg border p-4 flex flex-col gap-1',
        colors[variant]
      )}
    >
      <span className="text-xs text-[#6E8091]">{label}</span>
      <span className="text-lg font-semibold text-[#32363A]">{value}</span>
    </div>
  );
}

function TripStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    LOADED: 'bg-blue-100 text-blue-700',
    IN_TRANSIT: 'bg-amber-100 text-amber-700',
    ARRIVED: 'bg-purple-100 text-purple-700',
    POURING: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    DIVERTED: 'bg-slate-100 text-slate-600',
  };
  const labels: Record<string, string> = {
    LOADED: 'محمل', IN_TRANSIT: 'في الطريق',
    ARRIVED: 'وصل', POURING: 'صب', COMPLETED: 'مكتمل', DIVERTED: 'محول',
  };
  return (
    <span className={clsx('px-2 py-0.5 rounded text-xs', styles[status] ?? 'bg-slate-100 text-slate-600')}>
      {labels[status] ?? status}
    </span>
  );
}

function DocumentIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function ChartIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>; }
function TruckIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h2a2 2 0 012 2v5a2 2 0 01-2 2h-2M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>; }
function FinanceIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
