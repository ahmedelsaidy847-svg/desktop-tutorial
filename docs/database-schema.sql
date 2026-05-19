-- ============================================================
-- ERP-RMC: المخطط الكامل لقاعدة البيانات
-- نظام إدارة محطات الخرسانة الجاهزة
-- يحاكي معايير SAP FI + HCM
-- ============================================================

-- ============================
-- PHASE 1: FI-CORE ENGINE
-- المحرك المالي والمحاسبي
-- ============================

-- مخطط حسابات متعدد المستويات (Chart of Accounts)
CREATE TABLE coa_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(10) UNIQUE NOT NULL,
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200) NOT NULL,
    parent_id       UUID REFERENCES coa_groups(id),
    level           SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),
    group_type      VARCHAR(20) NOT NULL CHECK (group_type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE','COST')),
    is_posting      BOOLEAN DEFAULT FALSE,  -- هل يقبل القيود مباشرة؟
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- دفتر الأستاذ العام (General Ledger Accounts)
CREATE TABLE gl_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code    VARCHAR(20) UNIQUE NOT NULL,
    account_name_ar VARCHAR(300) NOT NULL,
    account_name_en VARCHAR(300) NOT NULL,
    coa_group_id    UUID NOT NULL REFERENCES coa_groups(id),
    account_type    VARCHAR(20) NOT NULL CHECK (account_type IN ('BALANCE_SHEET','P_AND_L','STATISTICAL')),
    currency        VARCHAR(3) DEFAULT 'SAR',
    is_reconcile    BOOLEAN DEFAULT FALSE, -- حساب تسوية (مورد/عميل)
    is_bank         BOOLEAN DEFAULT FALSE,
    is_cash         BOOLEAN DEFAULT FALSE,
    tax_category    VARCHAR(20),           -- VAT / EXEMPT / ZERO_RATED
    cost_center_req BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- مراكز التكلفة (Cost Centers)
CREATE TABLE cost_centers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    parent_id       UUID REFERENCES cost_centers(id),
    center_type     VARCHAR(30) CHECK (center_type IN ('PLANT','DEPARTMENT','VEHICLE','PROJECT')),
    plant_id        UUID,  -- ربط بمحطة الخرسانة
    is_active       BOOLEAN DEFAULT TRUE
);

-- الفترات المحاسبية (Fiscal Periods)
CREATE TABLE fiscal_periods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year     SMALLINT NOT NULL,
    period_number   SMALLINT NOT NULL CHECK (period_number BETWEEN 1 AND 16), -- 12 شهر + 4 فترات خاصة
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status          VARCHAR(10) DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED','BLOCKED')),
    UNIQUE(fiscal_year, period_number)
);

-- رأس القيد المحاسبي (Journal Entry Header)
CREATE TABLE journal_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number    VARCHAR(30) UNIQUE NOT NULL,
    entry_date      DATE NOT NULL,
    posting_date    DATE NOT NULL,
    fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),
    entry_type      VARCHAR(30) NOT NULL CHECK (entry_type IN (
                        'MANUAL','AP_INVOICE','AR_INVOICE','PAYROLL',
                        'DEPRECIATION','CLOSING','REVERSAL','JOB_COSTING'
                    )),
    reference_doc   VARCHAR(100),   -- رقم المستند المصدر
    reference_type  VARCHAR(50),    -- نوع المستند (SALES_ORDER, PAYROLL_RUN...)
    description_ar  TEXT,
    description_en  TEXT,
    currency        VARCHAR(3) DEFAULT 'SAR',
    exchange_rate   NUMERIC(12,6) DEFAULT 1.0,
    total_debit     NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_credit    NUMERIC(18,4) NOT NULL DEFAULT 0,
    is_balanced     BOOLEAN GENERATED ALWAYS AS (ABS(total_debit - total_credit) < 0.01) STORED,
    status          VARCHAR(15) DEFAULT 'POSTED' CHECK (status IN ('DRAFT','POSTED','REVERSED')),
    reversal_of     UUID REFERENCES journal_entries(id),
    posted_by       UUID NOT NULL,
    posted_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT balanced_entry CHECK (ABS(total_debit - total_credit) < 0.01)
);

-- سطور القيد المحاسبي (Journal Entry Lines)
CREATE TABLE journal_entry_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number     SMALLINT NOT NULL,
    gl_account_id   UUID NOT NULL REFERENCES gl_accounts(id),
    cost_center_id  UUID REFERENCES cost_centers(id),
    debit_amount    NUMERIC(18,4) DEFAULT 0,
    credit_amount   NUMERIC(18,4) DEFAULT 0,
    currency        VARCHAR(3) DEFAULT 'SAR',
    amount_foreign  NUMERIC(18,4),
    description     TEXT,
    tax_code        VARCHAR(10),
    tax_amount      NUMERIC(18,4) DEFAULT 0,
    partner_id      UUID,           -- مورد أو عميل
    partner_type    VARCHAR(10),    -- VENDOR / CUSTOMER
    UNIQUE(journal_entry_id, line_number)
);

CREATE INDEX idx_jel_gl_account ON journal_entry_lines(gl_account_id);
CREATE INDEX idx_jel_cost_center ON journal_entry_lines(cost_center_id);
CREATE INDEX idx_je_posting_date ON journal_entries(posting_date, fiscal_period_id);

-- ============================
-- الموردون والعملاء
-- ============================

CREATE TABLE business_partners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bp_code         VARCHAR(20) UNIQUE NOT NULL,
    bp_name_ar      VARCHAR(300) NOT NULL,
    bp_name_en      VARCHAR(300),
    bp_type         VARCHAR(10) NOT NULL CHECK (bp_type IN ('CUSTOMER','VENDOR','BOTH')),
    tax_number      VARCHAR(50),        -- الرقم الضريبي
    commercial_reg  VARCHAR(50),        -- السجل التجاري
    gl_recon_account UUID REFERENCES gl_accounts(id), -- حساب التسوية
    credit_limit    NUMERIC(18,4) DEFAULT 0,
    credit_days     SMALLINT DEFAULT 30,
    payment_terms   VARCHAR(50),
    address_ar      TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(200),
    bank_name       VARCHAR(200),
    bank_iban       VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- فواتير الموردين (AP Invoices)
CREATE TABLE ap_invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,
    vendor_id       UUID NOT NULL REFERENCES business_partners(id),
    invoice_date    DATE NOT NULL,
    due_date        DATE NOT NULL,
    posting_date    DATE NOT NULL,
    fiscal_period_id UUID REFERENCES fiscal_periods(id),
    subtotal        NUMERIC(18,4) NOT NULL,
    vat_amount      NUMERIC(18,4) DEFAULT 0,
    total_amount    NUMERIC(18,4) NOT NULL,
    paid_amount     NUMERIC(18,4) DEFAULT 0,
    balance         NUMERIC(18,4) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    currency        VARCHAR(3) DEFAULT 'SAR',
    payment_terms   VARCHAR(50),
    description     TEXT,
    journal_entry_id UUID REFERENCES journal_entries(id),
    status          VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('DRAFT','OPEN','PARTIAL','PAID','CANCELLED')),
    created_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- سطور فواتير الموردين
CREATE TABLE ap_invoice_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ap_invoice_id   UUID NOT NULL REFERENCES ap_invoices(id) ON DELETE CASCADE,
    line_number     SMALLINT NOT NULL,
    description     TEXT NOT NULL,
    gl_account_id   UUID REFERENCES gl_accounts(id),
    cost_center_id  UUID REFERENCES cost_centers(id),
    quantity        NUMERIC(12,4) DEFAULT 1,
    unit_price      NUMERIC(18,4) NOT NULL,
    vat_rate        NUMERIC(5,2) DEFAULT 15.0,
    vat_amount      NUMERIC(18,4),
    line_total      NUMERIC(18,4) NOT NULL
);

-- فواتير العملاء (AR Invoices)
CREATE TABLE ar_invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,
    customer_id     UUID NOT NULL REFERENCES business_partners(id),
    sales_order_id  UUID,               -- ربط بأمر البيع
    invoice_date    DATE NOT NULL,
    due_date        DATE NOT NULL,
    posting_date    DATE NOT NULL,
    fiscal_period_id UUID REFERENCES fiscal_periods(id),
    subtotal        NUMERIC(18,4) NOT NULL,
    vat_amount      NUMERIC(18,4) DEFAULT 0,
    total_amount    NUMERIC(18,4) NOT NULL,
    collected_amount NUMERIC(18,4) DEFAULT 0,
    balance         NUMERIC(18,4) GENERATED ALWAYS AS (total_amount - collected_amount) STORED,
    currency        VARCHAR(3) DEFAULT 'SAR',
    e_invoice_uuid  VARCHAR(100),       -- رقم الفاتورة الإلكترونية (ZATCA)
    e_invoice_hash  VARCHAR(500),
    e_invoice_qr    TEXT,
    journal_entry_id UUID REFERENCES journal_entries(id),
    status          VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('DRAFT','OPEN','PARTIAL','COLLECTED','CANCELLED','DISPUTED')),
    created_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ar_customer ON ar_invoices(customer_id, status);
CREATE INDEX idx_ar_due_date ON ar_invoices(due_date) WHERE status IN ('OPEN','PARTIAL');

-- ============================
-- تكاليف أوامر التشغيل (Job Order Costing)
-- ============================

CREATE TABLE production_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(30) UNIQUE NOT NULL,
    plant_id        UUID NOT NULL,
    mix_design_id   UUID NOT NULL,      -- تصميم الخلطة
    sales_order_id  UUID,
    planned_qty_m3  NUMERIC(10,3) NOT NULL,
    actual_qty_m3   NUMERIC(10,3) DEFAULT 0,
    production_date DATE NOT NULL,
    shift           VARCHAR(10) CHECK (shift IN ('MORNING','EVENING','NIGHT')),
    status          VARCHAR(20) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','IN_PROGRESS','COMPLETED','CANCELLED')),
    standard_cost   NUMERIC(18,4),      -- التكلفة المعيارية
    actual_cost     NUMERIC(18,4),      -- التكلفة الفعلية
    variance_amount NUMERIC(18,4),      -- قيمة الانحراف
    variance_pct    NUMERIC(8,4),       -- نسبة الانحراف %
    closed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- استهلاك المواد الفعلي لكل أمر إنتاج
CREATE TABLE production_material_consumption (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID NOT NULL REFERENCES production_orders(id),
    material_id     UUID NOT NULL,
    planned_qty     NUMERIC(12,4),
    actual_qty      NUMERIC(12,4) NOT NULL,
    unit_cost       NUMERIC(18,4) NOT NULL,
    total_cost      NUMERIC(18,4) GENERATED ALWAYS AS (actual_qty * unit_cost) STORED,
    source          VARCHAR(20) DEFAULT 'BATCHING' CHECK (source IN ('MANUAL','BATCHING','ESTIMATE')),
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- التكاليف غير المباشرة للمحطة
CREATE TABLE production_overhead_allocation (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID NOT NULL REFERENCES production_orders(id),
    overhead_type   VARCHAR(50) NOT NULL, -- DEPRECIATION, ELECTRICITY, LABOR...
    cost_center_id  UUID REFERENCES cost_centers(id),
    allocation_base NUMERIC(12,4),       -- أساس التوزيع (م³)
    rate_per_unit   NUMERIC(18,4),
    allocated_amount NUMERIC(18,4) NOT NULL,
    gl_account_id   UUID REFERENCES gl_accounts(id)
);

-- ============================
-- PHASE 2: HCM - الموارد البشرية
-- ============================

CREATE TABLE departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    parent_id       UUID REFERENCES departments(id),
    cost_center_id  UUID REFERENCES cost_centers(id),
    manager_id      UUID,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE job_positions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    title_ar        VARCHAR(200) NOT NULL,
    title_en        VARCHAR(200),
    department_id   UUID REFERENCES departments(id),
    employee_group  VARCHAR(30) NOT NULL CHECK (employee_group IN (
                        'MANAGEMENT','ADMINISTRATION','OPERATIONS',
                        'DRIVER','TECHNICIAN','LABOR'
                    )), -- مجموعة الموظف - مهمة لتوجيه القيد المالي
    basic_salary_min NUMERIC(12,4),
    basic_salary_max NUMERIC(12,4)
);

CREATE TABLE employees (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_number      VARCHAR(20) UNIQUE NOT NULL,
    national_id     VARCHAR(20) UNIQUE,
    full_name_ar    VARCHAR(300) NOT NULL,
    full_name_en    VARCHAR(300),
    nationality     VARCHAR(100),
    date_of_birth   DATE,
    gender          CHAR(1) CHECK (gender IN ('M','F')),
    hire_date       DATE NOT NULL,
    termination_date DATE,
    department_id   UUID REFERENCES departments(id),
    position_id     UUID REFERENCES job_positions(id),
    employee_group  VARCHAR(30) NOT NULL, -- نسخة من job_positions لسرعة الاستعلام
    cost_center_id  UUID REFERENCES cost_centers(id),
    plant_id        UUID,               -- المحطة المرتبط بها السائق
    basic_salary    NUMERIC(12,4) NOT NULL,
    housing_allowance NUMERIC(12,4) DEFAULT 0,
    transport_allowance NUMERIC(12,4) DEFAULT 0,
    other_allowances NUMERIC(12,4) DEFAULT 0,
    bank_iban       VARCHAR(50),
    bank_name       VARCHAR(200),
    is_active       BOOLEAN DEFAULT TRUE,
    photo_url       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emp_group ON employees(employee_group);
CREATE INDEX idx_emp_plant ON employees(plant_id);

-- إدارة الحضور والغياب
CREATE TABLE attendance_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES employees(id),
    attendance_date DATE NOT NULL,
    check_in        TIMESTAMPTZ,
    check_out       TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL CHECK (status IN (
                        'PRESENT','ABSENT','HALF_DAY','LEAVE',
                        'SICK_LEAVE','ANNUAL_LEAVE','HOLIDAY','LOP'
                    )),
    lop_days        NUMERIC(3,2) DEFAULT 0, -- أيام الغياب بدون أجر
    overtime_hours  NUMERIC(4,2) DEFAULT 0,
    source          VARCHAR(20) DEFAULT 'MANUAL' CHECK (source IN ('BIOMETRIC','MANUAL','SYSTEM')),
    notes           TEXT,
    approved_by     UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- ============================
-- وحدة السلف والقروض
-- ============================

CREATE TABLE loan_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_code     VARCHAR(20) UNIQUE NOT NULL,
    policy_name_ar  VARCHAR(200) NOT NULL,
    loan_type       VARCHAR(30) NOT NULL CHECK (loan_type IN (
                        'SALARY_ADVANCE','PERSONAL_LOAN','EMERGENCY_LOAN','HOUSING_LOAN'
                    )),
    max_amount      NUMERIC(18,4),
    max_months      SMALLINT,           -- أقصى عدد أقساط
    interest_rate   NUMERIC(5,4) DEFAULT 0, -- معدل الفائدة السنوي
    max_salary_pct  NUMERIC(5,2) DEFAULT 50.0, -- أقصى نسبة من الراتب كقسط
    lop_action      VARCHAR(20) DEFAULT 'CARRY_FORWARD' CHECK (lop_action IN (
                        'CARRY_FORWARD',    -- ترحيل القسط للشهر القادم
                        'NO_DEDUCTION',     -- لا خصم وتمديد القرض
                        'PARTIAL_DEDUCT'    -- خصم جزئي
                    )),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_loans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_number     VARCHAR(30) UNIQUE NOT NULL,
    employee_id     UUID NOT NULL REFERENCES employees(id),
    policy_id       UUID NOT NULL REFERENCES loan_policies(id),
    loan_amount     NUMERIC(18,4) NOT NULL,
    interest_amount NUMERIC(18,4) DEFAULT 0,
    total_amount    NUMERIC(18,4) GENERATED ALWAYS AS (loan_amount + interest_amount) STORED,
    monthly_installment NUMERIC(18,4) NOT NULL,
    total_installments  SMALLINT NOT NULL,
    paid_installments   SMALLINT DEFAULT 0,
    start_date      DATE NOT NULL,
    expected_end_date DATE NOT NULL,
    remaining_balance NUMERIC(18,4),
    status          VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN (
                        'PENDING','ACTIVE','COMPLETED','SETTLED','CANCELLED'
                    )),
    settlement_source VARCHAR(30), -- GRATUITY / VOLUNTARY / RESTRUCTURE
    approved_by     UUID,
    approval_date   DATE,
    gl_account_id   UUID REFERENCES gl_accounts(id), -- حساب السلفة في الأستاذ
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loans_employee ON employee_loans(employee_id, status);

-- جدولة أقساط السلف
CREATE TABLE loan_installment_schedule (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id         UUID NOT NULL REFERENCES employee_loans(id) ON DELETE CASCADE,
    installment_number SMALLINT NOT NULL,
    due_year        SMALLINT NOT NULL,
    due_month       SMALLINT NOT NULL CHECK (due_month BETWEEN 1 AND 12),
    due_date        DATE NOT NULL,
    principal_amount NUMERIC(18,4) NOT NULL,
    interest_amount NUMERIC(18,4) DEFAULT 0,
    total_due       NUMERIC(18,4) GENERATED ALWAYS AS (principal_amount + interest_amount) STORED,
    deducted_amount NUMERIC(18,4) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN (
                        'SCHEDULED','DEDUCTED','CARRIED_FORWARD',
                        'SKIPPED','SETTLED'
                    )),
    deducted_in_payroll UUID,     -- ID دورة الرواتب التي تم خصمه فيها
    carry_forward_to    UUID REFERENCES loan_installment_schedule(id),
    notes           TEXT,
    UNIQUE(loan_id, installment_number)
);

-- ============================
-- دورات الرواتب
-- ============================

CREATE TABLE payroll_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_number      VARCHAR(30) UNIQUE NOT NULL,
    payroll_year    SMALLINT NOT NULL,
    payroll_month   SMALLINT NOT NULL CHECK (payroll_month BETWEEN 1 AND 12),
    run_type        VARCHAR(20) DEFAULT 'REGULAR' CHECK (run_type IN ('REGULAR','SUPPLEMENTARY','FINAL')),
    status          VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','CALCULATED','APPROVED','POSTED','REVERSED')),
    total_gross     NUMERIC(18,4) DEFAULT 0,
    total_deductions NUMERIC(18,4) DEFAULT 0,
    total_net       NUMERIC(18,4) DEFAULT 0,
    journal_entry_id UUID REFERENCES journal_entries(id),
    approved_by     UUID,
    approved_at     TIMESTAMPTZ,
    posted_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(payroll_year, payroll_month, run_type)
);

-- سطور الرواتب لكل موظف
CREATE TABLE payroll_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id  UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id),
    working_days    SMALLINT DEFAULT 30,
    present_days    SMALLINT,
    lop_days        NUMERIC(4,2) DEFAULT 0,
    basic_salary    NUMERIC(12,4) NOT NULL,
    housing_allowance NUMERIC(12,4) DEFAULT 0,
    transport_allowance NUMERIC(12,4) DEFAULT 0,
    driver_commission NUMERIC(12,4) DEFAULT 0,   -- عمولة السائق
    other_allowances NUMERIC(12,4) DEFAULT 0,
    overtime_amount NUMERIC(12,4) DEFAULT 0,
    gross_salary    NUMERIC(12,4) NOT NULL,
    loan_deduction  NUMERIC(12,4) DEFAULT 0,     -- إجمالي استقطاع السلف
    gosi_deduction  NUMERIC(12,4) DEFAULT 0,     -- اشتراك التأمينات
    other_deductions NUMERIC(12,4) DEFAULT 0,
    total_deductions NUMERIC(12,4) DEFAULT 0,
    net_salary      NUMERIC(12,4) NOT NULL,
    employee_group  VARCHAR(30),                  -- نسخة لتوجيه القيد
    cost_center_id  UUID REFERENCES cost_centers(id),
    UNIQUE(payroll_run_id, employee_id)
);

-- أنواع الأجور (Wage Types) - تحاكي SAP Wage Types
CREATE TABLE wage_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(10) UNIQUE NOT NULL,  -- مثال: /001 /002
    name_ar         VARCHAR(200) NOT NULL,
    category        VARCHAR(20) NOT NULL CHECK (category IN ('EARNING','DEDUCTION','INFO')),
    is_taxable      BOOLEAN DEFAULT TRUE,
    is_gosi_base    BOOLEAN DEFAULT FALSE,
    symbolic_account_code VARCHAR(20) NOT NULL,  -- ربط بالحساب الرمزي
    is_active       BOOLEAN DEFAULT TRUE
);

-- الحسابات الرمزية (Symbolic Accounts) - طبقة التجريد الحرجة
CREATE TABLE symbolic_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,  -- مثال: SA-SALARY-BASIC
    name_ar         VARCHAR(200) NOT NULL,
    description     TEXT
);

-- قواعد توجيه القيد من الحساب الرمزي إلى GL بناءً على مجموعة الموظف
CREATE TABLE symbolic_account_gl_mapping (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbolic_account_id UUID NOT NULL REFERENCES symbolic_accounts(id),
    employee_group  VARCHAR(30) NOT NULL,         -- MANAGEMENT / DRIVER / etc.
    posting_side    VARCHAR(6) NOT NULL CHECK (posting_side IN ('DEBIT','CREDIT')),
    gl_account_id   UUID NOT NULL REFERENCES gl_accounts(id),
    cost_center_id  UUID REFERENCES cost_centers(id),
    valid_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to        DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    UNIQUE(symbolic_account_id, employee_group, posting_side, valid_from)
);

-- ============================
-- PHASE 3: RMC OPERATIONS
-- عمليات محطات الخرسانة الجاهزة
-- ============================

CREATE TABLE rmc_plants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_code      VARCHAR(20) UNIQUE NOT NULL,
    plant_name_ar   VARCHAR(200) NOT NULL,
    plant_name_en   VARCHAR(200),
    location        VARCHAR(300),
    gps_lat         NUMERIC(10,7),
    gps_lng         NUMERIC(10,7),
    capacity_m3_hr  NUMERIC(8,2),   -- طاقة إنتاجية م³/ساعة
    cost_center_id  UUID REFERENCES cost_centers(id),
    batching_controller_ip VARCHAR(50), -- IP معدة وزن المحطة
    batching_api_endpoint TEXT,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE raw_materials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_code   VARCHAR(30) UNIQUE NOT NULL,
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    material_type   VARCHAR(30) NOT NULL CHECK (material_type IN (
                        'CEMENT','AGGREGATE_FINE','AGGREGATE_COARSE',
                        'WATER','ADMIXTURE','FLY_ASH','SILICA_FUME'
                    )),
    unit_of_measure VARCHAR(10) NOT NULL, -- KG / TON / LITER / M3
    current_stock   NUMERIC(14,4) DEFAULT 0,
    min_stock_level NUMERIC(14,4) DEFAULT 0,
    avg_unit_cost   NUMERIC(18,4),
    gl_account_id   UUID REFERENCES gl_accounts(id),
    is_active       BOOLEAN DEFAULT TRUE
);

-- تصاميم الخلطات (Mix Designs)
CREATE TABLE mix_designs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_code     VARCHAR(30) UNIQUE NOT NULL,
    design_name     VARCHAR(200) NOT NULL,
    concrete_grade  VARCHAR(20) NOT NULL,  -- C25 / C30 / C40 / C50
    slump_mm        SMALLINT,
    max_wc_ratio    NUMERIC(4,3),
    exposure_class  VARCHAR(20),
    standard_cost_per_m3 NUMERIC(18,4),   -- التكلفة المعيارية للمتر المكعب
    is_approved     BOOLEAN DEFAULT FALSE,
    approved_by     VARCHAR(200),
    approved_date   DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- مكونات تصميم الخلطة لكل م³
CREATE TABLE mix_design_components (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mix_design_id   UUID NOT NULL REFERENCES mix_designs(id) ON DELETE CASCADE,
    material_id     UUID NOT NULL REFERENCES raw_materials(id),
    quantity_per_m3 NUMERIC(12,4) NOT NULL,  -- الكمية المعيارية لكل م³
    tolerance_pct   NUMERIC(5,2) DEFAULT 2.0, -- نسبة التسامح ±%
    UNIQUE(mix_design_id, material_id)
);

CREATE TABLE vehicles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number  VARCHAR(30) UNIQUE NOT NULL,
    plate_number    VARCHAR(30) UNIQUE,
    vehicle_type    VARCHAR(30) CHECK (vehicle_type IN ('TRANSIT_MIXER','PUMP','DUMP_TRUCK','WATER_TANKER')),
    drum_capacity_m3 NUMERIC(5,2),
    plant_id        UUID REFERENCES rmc_plants(id),
    driver_id       UUID REFERENCES employees(id),
    is_active       BOOLEAN DEFAULT TRUE
);

-- أوامر البيع (Sales Orders)
CREATE TABLE sales_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(30) UNIQUE NOT NULL,
    customer_id     UUID NOT NULL REFERENCES business_partners(id),
    plant_id        UUID NOT NULL REFERENCES rmc_plants(id),
    order_date      DATE NOT NULL,
    delivery_date   DATE NOT NULL,
    delivery_time   TIME,
    project_name    VARCHAR(300),
    delivery_address TEXT NOT NULL,
    gps_lat         NUMERIC(10,7),
    gps_lng         NUMERIC(10,7),
    distance_km     NUMERIC(8,2),
    mix_design_id   UUID NOT NULL REFERENCES mix_designs(id),
    ordered_qty_m3  NUMERIC(10,3) NOT NULL,
    delivered_qty_m3 NUMERIC(10,3) DEFAULT 0,
    unit_price      NUMERIC(18,4) NOT NULL,
    pump_required   BOOLEAN DEFAULT FALSE,
    pump_type       VARCHAR(30),        -- BOOM_PUMP / LINE_PUMP
    pump_length_m   NUMERIC(6,1),
    pump_price      NUMERIC(18,4) DEFAULT 0,
    pour_type       VARCHAR(50),        -- SLAB / COLUMN / FOUNDATION / WALL
    special_req     TEXT,
    status          VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN (
                        'DRAFT','CONFIRMED','IN_DELIVERY',
                        'PARTIAL_DELIVERED','COMPLETED','CANCELLED','DIVERTED'
                    )),
    total_amount    NUMERIC(18,4),
    ar_invoice_id   UUID REFERENCES ar_invoices(id),
    credit_checked  BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_so_customer ON sales_orders(customer_id, status);
CREATE INDEX idx_so_delivery ON sales_orders(delivery_date, plant_id);

-- رحلات التوصيل (Delivery Trips)
CREATE TABLE delivery_trips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_number     VARCHAR(30) UNIQUE NOT NULL,
    sales_order_id  UUID NOT NULL REFERENCES sales_orders(id),
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    driver_id       UUID NOT NULL REFERENCES employees(id),
    production_order_id UUID REFERENCES production_orders(id),
    loaded_qty_m3   NUMERIC(8,3) NOT NULL,
    delivered_qty_m3 NUMERIC(8,3),
    wasted_qty_m3   NUMERIC(8,3) DEFAULT 0,
    load_time       TIMESTAMPTZ,
    departure_time  TIMESTAMPTZ,
    arrival_time    TIMESTAMPTZ,
    pour_start_time TIMESTAMPTZ,
    pour_end_time   TIMESTAMPTZ,
    return_time     TIMESTAMPTZ,
    trip_distance_km NUMERIC(8,2),
    status          VARCHAR(20) DEFAULT 'LOADED' CHECK (status IN (
                        'LOADED','IN_TRANSIT','ARRIVED','POURING',
                        'COMPLETED','DUMPED','DIVERTED'
                    )),
    dump_diverted_to UUID REFERENCES sales_orders(id), -- لوجستيات التحويل
    divert_reason   TEXT,
    driver_commission_amount NUMERIC(12,4),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trips_driver ON delivery_trips(driver_id, load_time);
CREATE INDEX idx_trips_order ON delivery_trips(sales_order_id);

-- ============================
-- جدول عمولات السائقين
-- ============================

CREATE TABLE driver_commission_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name       VARCHAR(200) NOT NULL,
    basis           VARCHAR(20) NOT NULL CHECK (basis IN ('PER_TRIP','PER_KM','PER_M3','HYBRID')),
    min_distance_km NUMERIC(8,2),
    max_distance_km NUMERIC(8,2),
    commission_amount NUMERIC(12,4), -- مبلغ ثابت
    commission_rate   NUMERIC(5,4),  -- نسبة مئوية
    plant_id        UUID REFERENCES rmc_plants(id), -- لو خاص بمحطة
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    is_active       BOOLEAN DEFAULT TRUE
);
