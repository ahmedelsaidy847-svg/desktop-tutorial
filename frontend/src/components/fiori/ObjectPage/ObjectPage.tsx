import React, { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

export interface ObjectPageSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface ObjectPageAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface ObjectPageProps {
  title: string;
  subtitle?: string;
  objectNumber?: string;          // مثال: SO-2024-000123
  objectNumberUnit?: string;      // مثال: م³
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  };
  headerAttributes?: {
    label: string;
    value: string | React.ReactNode;
  }[];
  sections: ObjectPageSection[];
  actions?: ObjectPageAction[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  breadcrumbs?: { label: string; href?: string }[];
}

const STATUS_STYLES = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

const ACTION_STYLES = {
  primary: 'bg-[#0070F2] hover:bg-[#0057B8] text-white shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 text-[#32363A] border border-[#BCC3CA]',
  danger: 'bg-white hover:bg-red-50 text-red-600 border border-red-300',
  ghost: 'bg-transparent hover:bg-slate-100 text-[#0070F2]',
};

/**
 * Object Page Floorplan - يحاكي SAP Fiori Object Page
 * يدعم:
 *   - Dynamic Page Header (ينطوي عند التمرير)
 *   - Anchor Navigation بين الأقسام
 *   - تبديل سلس بين و据ع القراءة والتعديل
 *   - دعم RTL كامل
 */
export const ObjectPage: React.FC<ObjectPageProps> = ({
  title,
  subtitle,
  objectNumber,
  objectNumberUnit,
  status,
  headerAttributes = [],
  sections,
  actions = [],
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  isLoading = false,
  breadcrumbs = [],
}) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // كشف طي الرأس عند التمرير للأسفل
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollTop = contentRef.current.scrollTop;
        setIsHeaderCollapsed(scrollTop > 80);
      }
    };
    const el = contentRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // مزامنة القسم النشط مع التمرير
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: contentRef.current, threshold: 0.3 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el && contentRef.current) {
      contentRef.current.scrollTo({
        top: el.offsetTop - 120,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  }, []);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6F7]" dir="rtl">
      {/* ======================== */}
      {/* DYNAMIC PAGE HEADER      */}
      {/* ======================== */}
      <div
        ref={headerRef}
        className={clsx(
          'bg-white border-b border-[#DFE3E8] transition-all duration-300 shadow-sm',
          isHeaderCollapsed ? 'py-2' : 'py-4'
        )}
      >
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && !isHeaderCollapsed && (
          <nav className="px-6 mb-2">
            <ol className="flex items-center gap-1 text-sm text-[#6E8091]">
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-[#BCC3CA]">/</span>}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="hover:text-[#0070F2] transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-[#32363A]">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="px-6">
          <div className="flex items-start justify-between gap-4">
            {/* عنوان الصفحة */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className={clsx(
                    'font-bold text-[#32363A] truncate transition-all duration-300',
                    isHeaderCollapsed ? 'text-lg' : 'text-2xl'
                  )}
                >
                  {title}
                </h1>
                {status && (
                  <span
                    className={clsx(
                      'px-3 py-0.5 rounded-full text-xs font-medium border',
                      STATUS_STYLES[status.variant]
                    )}
                  >
                    {status.label}
                  </span>
                )}
              </div>

              {!isHeaderCollapsed && (
                <>
                  {subtitle && (
                    <p className="mt-1 text-sm text-[#6E8091]">{subtitle}</p>
                  )}

                  {/* سمة الرقم الأساسية */}
                  {objectNumber && (
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-light text-[#32363A]">
                        {objectNumber}
                      </span>
                      {objectNumberUnit && (
                        <span className="text-sm text-[#6E8091]">
                          {objectNumberUnit}
                        </span>
                      )}
                    </div>
                  )}

                  {/* خصائص الرأس */}
                  {headerAttributes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                      {headerAttributes.map((attr, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-xs text-[#6E8091]">
                            {attr.label}:
                          </span>
                          <span className="text-sm font-medium text-[#32363A]">
                            {attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center gap-2 shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={onCancel}
                    className={clsx(
                      'px-4 py-2 rounded text-sm font-medium transition-colors',
                      ACTION_STYLES.secondary
                    )}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={clsx(
                      'px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2',
                      ACTION_STYLES.primary,
                      isSaving && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {isSaving && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </>
              ) : (
                <>
                  {actions.map((action) => (
                    <button
                      key={action.key}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={clsx(
                        'px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2',
                        ACTION_STYLES[action.variant ?? 'secondary'],
                        action.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className={clsx(
                        'px-4 py-2 rounded text-sm font-medium transition-colors',
                        ACTION_STYLES.primary
                      )}
                    >
                      تعديل
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================== */}
      {/* ANCHOR NAVIGATION BAR   */}
      {/* ======================== */}
      <div className="bg-white border-b border-[#DFE3E8] shadow-sm sticky top-0 z-10">
        <div className="px-6 flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeSection === section.id
                  ? 'border-[#0070F2] text-[#0070F2]'
                  : 'border-transparent text-[#6E8091] hover:text-[#32363A] hover:border-[#BCC3CA]'
              )}
            >
              {section.icon && (
                <span className="w-4 h-4">{section.icon}</span>
              )}
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* ======================== */}
      {/* SCROLLABLE CONTENT       */}
      {/* ======================== */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#0070F2] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6E8091]">جاري تحميل البيانات...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 py-4 space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                className="bg-white rounded-lg border border-[#DFE3E8] shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-[#DFE3E8] bg-[#F5F6F7]">
                  <h2 className="text-base font-semibold text-[#32363A] flex items-center gap-2">
                    {section.icon && (
                      <span className="text-[#0070F2]">{section.icon}</span>
                    )}
                    {section.title}
                  </h2>
                </div>
                <div className="p-6">{section.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectPage;
