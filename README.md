# ERP-RMC: نظام إدارة مصانع ومحطات الخرسانة الجاهزة

## نظرة عامة على المشروع

نظام ERP متكامل مبني على معمارية الخدمات المصغرة (Microservices) يحاكي معايير SAP FI/HCM/Fiori، مصمم خصيصاً لإدارة محطات ومصانع الخرسانة الجاهزة (Ready-Mix Concrete).

## الوحدات الرئيسية

| الوحدة | الوصف | المعيار المرجعي |
|--------|--------|----------------|
| **FI-Core** | المحرك المالي والمحاسبي | SAP FI |
| **HCM** | إدارة الموارد البشرية والرواتب | SAP HCM |
| **RMC-Ops** | عمليات محطات الخرسانة | SAP PM/PP |
| **API-Gateway** | البوابة الموحدة للخدمات | SAP Integration Suite |

## التقنيات المستخدمة

### الواجهة الخلفية (Backend)
- **Node.js / TypeScript** - وقت التشغيل
- **PostgreSQL** - قاعدة البيانات الرئيسية
- **Redis** - التخزين المؤقت والطوابير
- **RabbitMQ** - نظام الرسائل بين الخدمات
- **Prisma ORM** - طبقة الوصول للبيانات

### الواجهة الأمامية (Frontend)
- **React 18** مع TypeScript
- **TailwindCSS** - التنسيق
- **Zustand** - إدارة الحالة
- **React Query** - إدارة البيانات
- **Recharts** - الرسوم البيانية

## هيكل المشروع

```
erp-rmc/
├── backend/
│   ├── services/
│   │   ├── fi-core/          # المحرك المالي
│   │   ├── hcm-service/      # الموارد البشرية
│   │   ├── payroll-service/  # الرواتب والسلف
│   │   ├── rmc-operations/   # عمليات الخرسانة
│   │   └── api-gateway/      # بوابة API
│   ├── shared/
│   │   ├── database/         # مخططات قاعدة البيانات
│   │   ├── models/           # النماذج المشتركة
│   │   └── events/           # أحداث الرسائل
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/       # المكونات المشتركة
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── services/         # خدمات API
│   │   ├── store/            # إدارة الحالة
│   │   └── theme/            # التصميم والألوان
│   └── package.json
└── docs/
    ├── database-schema.sql
    └── architecture.md
```

## بدء التشغيل

```bash
# تشغيل قواعد البيانات والخدمات
docker-compose up -d

# تثبيت تبعيات الواجهة الخلفية
cd backend && npm install

# تشغيل migrations
npx prisma migrate dev

# تثبيت وتشغيل الواجهة الأمامية
cd frontend && npm install && npm run dev
```
