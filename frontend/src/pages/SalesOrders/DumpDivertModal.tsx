import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Props {
  tripId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DumpDivertModal({ tripId, onClose, onSuccess }: Props) {
  const [targetOrderId, setTargetOrderId] = useState('');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');

  const { data: openOrders } = useQuery({
    queryKey: ['open-sales-orders'],
    queryFn: async () => {
      const res = await fetch('/api/sales-orders?status=CONFIRMED&status=IN_DELIVERY');
      const data = await res.json();
      return data.data;
    },
  });

  const divertMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sales-orders/trips/${tripId}/divert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSalesOrderId: targetOrderId,
          divertedQtyM3: parseFloat(qty),
          reason,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'خطأ غير متوقع');
      }
      return res.json();
    },
    onSuccess,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      dir="rtl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#32363A]">
              تحويل شحنة الخرسانة
            </h2>
            <p className="text-xs text-[#6E8091] mt-0.5">
              Dump & Divert - تحويل فوري لموقع آخر
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6E8091] hover:text-[#32363A] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {divertMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {(divertMutation.error as Error).message}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6E8091] mb-1">
              أمر البيع المستهدف *
            </label>
            <select
              value={targetOrderId}
              onChange={(e) => setTargetOrderId(e.target.value)}
              className="w-full px-3 py-2 border border-[#BCC3CA] rounded text-sm text-[#32363A] focus:outline-none focus:ring-2 focus:ring-[#0070F2]"
            >
              <option value="">اختر أمر البيع...</option>
              {openOrders?.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.customer?.bpNameAr} ({o.orderedQtyM3} م³)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E8091] mb-1">
              الكمية المحولة (م³) *
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-[#BCC3CA] rounded text-sm text-[#32363A] focus:outline-none focus:ring-2 focus:ring-[#0070F2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E8091] mb-1">
              سبب التحويل *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="مثال: رفض العميل / مشكلة في الموقع..."
              className="w-full px-3 py-2 border border-[#BCC3CA] rounded text-sm text-[#32363A] focus:outline-none focus:ring-2 focus:ring-[#0070F2] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[#BCC3CA] rounded text-[#32363A] hover:bg-slate-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => divertMutation.mutate()}
            disabled={
              !targetOrderId ||
              !qty ||
              !reason ||
              divertMutation.isPending
            }
            className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {divertMutation.isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            تأكيد التحويل
          </button>
        </div>
      </div>
    </div>
  );
}
