"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import NewProjectWizard from "@/app/NewProjectWizard";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    nav_projects:"Projects", new_project:"+ New Project", portfolio_value:"Portfolio Value",
    total_invoiced:"Total Invoiced", active_projects:"Active Projects", contracts:"contracts",
    currently_running:"currently running", of_portfolio:"% of portfolio",
    all:"All", active:"Active", on_hold:"On Hold", completed:"Completed",
    invoiced_of:"invoiced of", units_invoiced:"units invoiced",
    back_projects:"All Projects", gc_contact:"GC Contact", timeline:"Timeline", due:"Due",
    overall_progress:"Overall Progress", invoiced_pct:"% invoiced", of:"of",
    buildings:"Buildings", site_common:"Site & Common Areas",
    change_orders:"Change Orders", financials:"Financials", files:"Files",
    add_co:"+ Add CO", no_cos:"No change orders yet.", co_note:"Approved COs add to the contract total",
    submitted:"Submitted", total_approved_cos:"Total Approved COs",
    base_contract:"Base Contract Value", approved_cos:"Approved Change Orders",
    total_contract:"Total Contract Value", total_inv_label:"Total Invoiced (base + CO)",
    retainage_held:"10% Retainage Held", net_billed:"Net Billed to GC",
    payments_received:"Payments Received", outstanding:"Outstanding Balance",
    remaining_uninvoiced:"Remaining Uninvoiced Work", retainage_release:"Retainage to be Released",
    payment_log:"Payment Log", no_payments:"No payments recorded yet.",
    record_manual:"+ Record Manual Payment / Invoice", upload_file:"+ Upload File",
    units:"units", pending_review_short:"pending review",
    unit_type:"Unit Type", building_label:"Building",
    line_items_complete:"line items invoiced", all_clusters:"All work in this unit",
    photos:"photos", photo:"photo", submitted_by:"Submitted By",
    photo_doc:"Photo Documentation", no_photos:"No photos submitted yet",
    submit_photos:"📷 Submit Photos", approve:"✓ Approve", request_redo:"✗ Request Redo",
    mark_invoiced:"Mark as Invoiced", invoiced_locked:"✓ Invoiced — locked",
    invoiced_locked_sub:"This unit has been invoiced and cannot be modified.",
    mark_invoiced_title:"Mark as Invoiced",
    mark_invoiced_note:"This will count toward the progress bar and cannot be undone.",
    invoice_ref:"Invoice Reference (optional)", invoice_placeholder:"e.g. INV-0005",
    cancel:"Cancel", confirm:"Confirm", unit_price:"/ unit",
    invoiced:"Invoiced", remaining:"Remaining", view_items:"→ View items",
    lump_sum:"Lump Sum", not_started:"Not Started", pending:"Pending Review",
    approved:"Approved",
    s_active:"Active", s_on_hold:"On Hold", s_completed:"Completed", s_archived:"Archived",
    s_invoiced:"Invoiced", s_approved:"Approved", s_pending:"Pending Review",
    s_not_started:"Not Started", s_co_approved:"Approved", s_co_submitted:"Submitted",
    s_co_draft:"Draft", language:"Language",
    no_line_items:"No line items for this unit.",
    items:"items",
  },
  es: {
    nav_projects:"Proyectos", new_project:"+ Nuevo Proyecto", portfolio_value:"Valor del Portafolio",
    total_invoiced:"Total Facturado", active_projects:"Proyectos Activos", contracts:"contratos",
    currently_running:"en progreso", of_portfolio:"% del portafolio",
    all:"Todos", active:"Activo", on_hold:"En Pausa", completed:"Completado",
    invoiced_of:"facturado de", units_invoiced:"unidades facturadas",
    back_projects:"Todos los Proyectos", gc_contact:"Contacto GC", timeline:"Fechas", due:"Entrega",
    overall_progress:"Progreso General", invoiced_pct:"% facturado", of:"de",
    buildings:"Edificios", site_common:"Áreas Comunes y Exteriores",
    change_orders:"Órdenes de Cambio", financials:"Finanzas", files:"Archivos",
    add_co:"+ Agregar OC", no_cos:"No hay órdenes de cambio aún.",
    co_note:"Las OC aprobadas se suman al total del contrato",
    submitted:"Enviado", total_approved_cos:"Total OC Aprobadas",
    base_contract:"Contrato Base", approved_cos:"Órdenes de Cambio Aprobadas",
    total_contract:"Valor Total del Contrato", total_inv_label:"Total Facturado (base + OC)",
    retainage_held:"Retención del 10%", net_billed:"Neto Cobrado al GC",
    payments_received:"Pagos Recibidos", outstanding:"Saldo Pendiente",
    remaining_uninvoiced:"Trabajo Pendiente de Facturar", retainage_release:"Retención a Liberar",
    payment_log:"Historial de Pagos", no_payments:"No hay pagos registrados aún.",
    record_manual:"+ Registrar Pago Manual / Factura", upload_file:"+ Subir Archivo",
    units:"unidades", pending_review_short:"en revisión",
    unit_type:"Tipo de Unidad", building_label:"Edificio",
    line_items_complete:"partidas facturadas", all_clusters:"Todo el trabajo en esta unidad",
    photos:"fotos", photo:"foto", submitted_by:"Enviado por",
    photo_doc:"Evidencia Fotográfica", no_photos:"No se han enviado fotos aún",
    submit_photos:"📷 Enviar Fotos", approve:"✓ Aprobar", request_redo:"✗ Solicitar Corrección",
    mark_invoiced:"Marcar como Facturado", invoiced_locked:"✓ Facturado — bloqueado",
    invoiced_locked_sub:"Esta unidad ya fue facturada y no puede modificarse.",
    mark_invoiced_title:"Marcar como Facturado",
    mark_invoiced_note:"Esto actualizará el progreso del proyecto y no se puede deshacer.",
    invoice_ref:"Número de Factura (opcional)", invoice_placeholder:"ej. FAC-0005",
    cancel:"Cancelar", confirm:"Confirmar", unit_price:"/ unidad",
    invoiced:"Facturado", remaining:"Pendiente", view_items:"→ Ver partidas",
    lump_sum:"Suma Global", not_started:"Sin Iniciar", pending:"En Revisión",
    approved:"Aprobado",
    s_active:"Activo", s_on_hold:"En Pausa", s_completed:"Completado", s_archived:"Archivado",
    s_invoiced:"Facturado", s_approved:"Aprobado", s_pending:"En Revisión",
    s_not_started:"Sin Iniciar", s_co_approved:"Aprobada", s_co_submitted:"Enviada",
    s_co_draft:"Borrador", language:"Idioma",
    no_line_items:"No hay partidas para esta unidad.",
    items:"partidas",
  }
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

// Line item groups (craft clusters) — defined at project level
const GROUPS = [
  { id: 1, name: "Framing",              nameEs: "Encuadre",                    costCode: "06-100" },
  { id: 2, name: "Baseboard",            nameEs: "Zócalo",                      costCode: "06-200" },
  { id: 3, name: "Interior Doors",       nameEs: "Puertas Interiores",          costCode: "08-140" },
  { id: 4, name: "Entry Doors",          nameEs: "Puertas de Entrada",          costCode: "08-111" },
  { id: 5, name: "Hardware & Blinds",    nameEs: "Herrajes y Persianas",        costCode: "08-700" },
  { id: 6, name: "Bath Accessories",     nameEs: "Accesorios de Baño",          costCode: "10-280" },
  { id: 7, name: "Cabinets & Appliances",nameEs: "Gabinetes y Electrodomésticos",costCode: "12-350" },
  { id: 8, name: "Signage & Safety",     nameEs: "Señalización y Seguridad",   costCode: "10-145" },
];

// Buildings with units
const BUILDINGS = [
  {
    id: 1, name: "Building 102", units: [
      { id: 101, name: "Apt 102-A", type: "2BR",    totalItems: 7, invoicedItems: 7 },
      { id: 102, name: "Apt 102-B", type: "2BR",    totalItems: 7, invoicedItems: 7 },
      { id: 103, name: "Apt 102-C", type: "1BR",    totalItems: 6, invoicedItems: 6 },
      { id: 104, name: "Apt 102-D", type: "1BR",    totalItems: 6, invoicedItems: 5 },
      { id: 105, name: "Apt 102-E", type: "2BR ADA",totalItems: 7, invoicedItems: 4 },
    ]
  },
  {
    id: 2, name: "Building 108", units: [
      { id: 201, name: "Apt 108-A", type: "1BR",    totalItems: 6, invoicedItems: 3 },
      { id: 202, name: "Apt 108-B", type: "1BR",    totalItems: 6, invoicedItems: 0 },
      { id: 203, name: "Apt 108-C", type: "2BR",    totalItems: 7, invoicedItems: 0 },
    ]
  },
  {
    id: 3, name: "Building 202", units: [
      { id: 301, name: "Apt 202-A", type: "3BR",    totalItems: 8, invoicedItems: 8 },
      { id: 302, name: "Apt 202-B", type: "3BR",    totalItems: 8, invoicedItems: 6 },
      { id: 303, name: "Apt 202-C", type: "2BR",    totalItems: 7, invoicedItems: 2 },
      { id: 304, name: "Apt 202-D", type: "2BR",    totalItems: 7, invoicedItems: 0 },
    ]
  },
  {
    id: 4, name: "Building 208", units: [
      { id: 401, name: "Apt 208-A", type: "1BR",    totalItems: 6, invoicedItems: 0 },
      { id: 402, name: "Apt 208-B", type: "1BR",    totalItems: 6, invoicedItems: 0 },
      { id: 403, name: "Apt 208-C", type: "4BR",    totalItems: 9, invoicedItems: 0 },
    ]
  },
];

// Line items per unit (keyed by unit id — showing a 2BR sample for Apt 202-C)
const UNIT_LINE_ITEMS = {
  303: [
    { id: 1001, groupId: 1, label: "Tub Tile Demo",          labelEs: "Demo Azulejo Tina",           unitPrice: 200,  status: "invoiced",       photos: 2 },
    { id: 1002, groupId: 1, label: "Closet Framing — 2BR",   labelEs: "Encuadre Clóset — 2H",        unitPrice: 875,  status: "invoiced",       photos: 3 },
    { id: 1003, groupId: 2, label: "Wood Baseboard",         labelEs: "Zócalo de Madera",             unitPrice: 300,  status: "approved",       photos: 4 },
    { id: 1004, groupId: 3, label: "Interior Doors (7 single, 4 double)", labelEs: "Puertas Int. (7 simples, 4 dobles)", unitPrice: 610, status: "pending_review", photos: 2 },
    { id: 1005, groupId: 4, label: "Steel Entry Door",       labelEs: "Puerta de Entrada de Acero",  unitPrice: 105,  status: "approved",       photos: 1 },
    { id: 1006, groupId: 5, label: "Door Hardware",          labelEs: "Herrajes de Puerta",           unitPrice: 75,   status: "not_started",    photos: 0 },
    { id: 1007, groupId: 5, label: "Window Blinds",          labelEs: "Persianas",                    unitPrice: 50,   status: "not_started",    photos: 0 },
    { id: 1008, groupId: 6, label: "Full Bath Accessories",  labelEs: "Acces. Baño Completo",         unitPrice: 75,   status: "not_started",    photos: 0 },
    { id: 1009, groupId: 6, label: "Half Bath Accessories",  labelEs: "Acces. Medio Baño",            unitPrice: 45,   status: "not_started",    photos: 0 },
    { id: 1010, groupId: 7, label: "Kitchen Cabinets + Vanity", labelEs: "Gabinetes + Vanidad",      unitPrice: 565,  status: "not_started",    photos: 0 },
    { id: 1011, groupId: 7, label: "Appliance Install",      labelEs: "Instalación Electrodomésticos",unitPrice: 125, status: "not_started",    photos: 0 },
    { id: 1012, groupId: 8, label: "Unit Entry Signage",     labelEs: "Señal de Entrada",             unitPrice: 10,   status: "not_started",    photos: 0 },
    { id: 1013, groupId: 8, label: "Fire Extinguisher Mount",labelEs: "Extintor Montado",             unitPrice: 15,   status: "not_started",    photos: 0 },
  ]
};

// Lump-sum / site items (not tied to a building or unit)
const SITE_ITEMS = [
  { id: 901, label: "Community Building Upgrades", labelEs: "Mejoras Edificio Comunal", amount: 7500,  status: "not_started", photos: 0 },
  { id: 902, label: "Mail Kiosk",                  labelEs: "Kiosco de Correo",         amount: 2750,  status: "not_started", photos: 0 },
  { id: 903, label: "Mailboxes",                   labelEs: "Buzones",                  amount: 750,   status: "not_started", photos: 0 },
  { id: 904, label: "Playground Bench",            labelEs: "Banca de Juegos",          amount: 100,   status: "invoiced",    photos: 2 },
  { id: 905, label: "ADA Framing Mods",            labelEs: "Modificaciones ADA",       amount: 7700,  status: "approved",    photos: 5 },
];

const PROJECTS = [
  {
    id: 1, name: "Pickens Gardens Apartments", address: "102 Garden Drive, Pickens, SC 29671",
    gc: "Dominion Construction Group", gcContact: "Andrew Sutherland",
    gcEmail: "subcontracts@empireinctn.com", contractNum: "SCD2602-008",
    contractValue: 224888, status: "active", startDate: "Apr 8, 2026", endDate: "Nov 1, 2026",
    retainage: 10, totalItems: 76, invoicedItems: 22,
    buildings: BUILDINGS, siteItems: SITE_ITEMS,
    changeOrders: [
      { id: 1, coNum: "CO-001", description: "Additional blocking at ADA bathroom walls", amount: 2400, status: "approved", date: "Apr 14, 2026" },
      { id: 2, coNum: "CO-002", description: "Extra framing — community building HVAC chase", amount: 1850, status: "submitted", date: "Apr 18, 2026" },
    ],
    payments: [{ id: 1, date: "Apr 22, 2026", type: "Payment Received", amount: 18450, ref: "ACH-4421", note: "Invoice #1 — 14-day cycle" }],
  },
  { id: 2, name: "Riverside Commons", address: "840 River Rd, Greenville, SC 29601", gc: "Apex Construction Partners", contractNum: "ACP-2025-041", contractValue: 185000, status: "active", totalItems: 48, invoicedItems: 31, retainage: 10, buildings: [], siteItems: [], changeOrders: [], payments: [] },
  { id: 3, name: "Oakwood Terrace", address: "215 Oak St, Columbia, SC 29201", gc: "Meridian Building Group", contractNum: "MBG-2024-017", contractValue: 97500, status: "completed", totalItems: 32, invoicedItems: 32, retainage: 10, buildings: [], siteItems: [], changeOrders: [], payments: [] },
  { id: 4, name: "Cedar Hill Renovations", address: "501 Cedar Blvd, Spartanburg, SC 29302", gc: "Summit Contractors LLC", contractNum: "SCL-2026-003", contractValue: 142300, status: "on_hold", totalItems: 60, invoicedItems: 9, retainage: 10, buildings: [], siteItems: [], changeOrders: [], payments: [] },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (a, b) => b === 0 ? 0 : Math.round((a / b) * 100);
const t = (lang) => (key) => T[lang]?.[key] ?? T.en[key] ?? key;
const loc = (lang, en, es) => lang === "es" && es ? es : en;

const bldgProgress = (b) => {
  const total = b.units.reduce((s, u) => s + u.totalItems, 0);
  const inv = b.units.reduce((s, u) => s + u.invoicedItems, 0);
  return { total, inv, pct: pct(inv, total) };
};

const unitStatus = (u) => {
  if (u.invoicedItems === u.totalItems) return "invoiced";
  if (u.invoicedItems > 0) return "in_progress";
  return "not_started";
};

const STATUS_CFG = (tr) => ({
  project: {
    active:    { label: tr("s_active"),    bg: "#064E3B", text: "#6EE7B7", dot: "#10B981" },
    on_hold:   { label: tr("s_on_hold"),   bg: "#78350F", text: "#FCD34D", dot: "#F59E0B" },
    completed: { label: tr("s_completed"), bg: "#1E3A5F", text: "#93C5FD", dot: "#3B82F6" },
  },
  unit: {
    invoiced:       { label: tr("s_invoiced"),    bg: "#1E3A5F", text: "#93C5FD" },
    in_progress:    { label: tr("s_pending"),     bg: "#78350F", text: "#FCD34D" },
    not_started:    { label: tr("s_not_started"), bg: "#1F2937", text: "#6B7280" },
  },
  lineitem: {
    invoiced:       { label: tr("s_invoiced"),    bg: "#1E3A5F", text: "#93C5FD" },
    approved:       { label: tr("s_approved"),    bg: "#064E3B", text: "#6EE7B7" },
    pending_review: { label: tr("s_pending"),     bg: "#78350F", text: "#FCD34D" },
    not_started:    { label: tr("s_not_started"), bg: "#1F2937", text: "#6B7280" },
  },
  co: {
    approved:  { label: tr("s_co_approved"),  bg: "#064E3B", text: "#6EE7B7" },
    submitted: { label: tr("s_co_submitted"), bg: "#78350F", text: "#FCD34D" },
    draft:     { label: tr("s_co_draft"),     bg: "#1F2937", text: "#9CA3AF" },
  },
});

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────

const Bar = ({ value, color = "#F59E0B", h = 6 }) => (
  <div style={{ background: "#1F2937", borderRadius: 99, height: h, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(value, 100)}%`, background: color, height: "100%", borderRadius: 99, transition: "width .5s ease" }} />
  </div>
);

const Badge = ({ status, config }) => {
  const c = config?.[status] || {};
  return (
    <span style={{ background: c.bg || "#1F2937", color: c.text || "#9CA3AF", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", padding: "3px 10px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {c.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />}
      {c.label || status}
    </span>
  );
};

const Card = ({ children, onClick, style: s = {} }) => (
  <div onClick={onClick} style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 12, padding: "16px 18px", cursor: onClick ? "pointer" : "default", transition: "border-color .15s, transform .15s", ...s }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = "#F59E0B55"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E2D3D"; e.currentTarget.style.transform = "none"; }}>
    {children}
  </div>
);

const BackBtn = ({ onClick, label }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 13, padding: "4px 0", marginBottom: 20 }}>← {label}</button>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>
);

const Tab = ({ label, active, onClick, n }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", borderBottom: active ? "2px solid #F59E0B" : "2px solid transparent", color: active ? "#F59E0B" : "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "10px 13px", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "color .15s" }}>
    {label}{n != null && <span style={{ background: active ? "#F59E0B22" : "#1F2937", color: active ? "#F59E0B" : "#6B7280", fontSize: 11, borderRadius: 99, padding: "1px 7px" }}>{n}</span>}
  </button>
);

const HR = () => <div style={{ borderTop: "1px solid #1E2D3D", margin: "18px 0" }} />;

const LangToggle = ({ lang, setLang }) => (
  <div style={{ display: "flex", background: "#0D1320", border: "1px solid #1E2D3D", borderRadius: 8, overflow: "hidden" }}>
    {["en", "es"].map(l => (
      <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "#F59E0B" : "none", border: "none", color: lang === l ? "#0A0F1E" : "#6B7280", fontWeight: 800, fontSize: 12, padding: "5px 11px", cursor: "pointer", transition: "all .15s" }}>{l.toUpperCase()}</button>
    ))}
  </div>
);

// ─── SCREEN 1 — PROJECTS LIST ─────────────────────────────────────────────────

function S1_Projects({ onSelect, tr, lang, projects, onNewProject }) {
  const [filter, setFilter] = useState("all");
  const SC = STATUS_CFG(tr);
  const visible = filter === "all" ? projects : projects.filter(p => p.status === filter);
  const totalVal = projects.reduce((s, p) => s + (p.contract_value || p.contractValue || 0), 0);
  const totalInv = projects.reduce((s, p) => s + pct(p.invoicedItems || 0, p.totalItems || 1) / 100 * (p.contract_value || p.contractValue || 0), 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".15em", color: "#F59E0B", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>King 23 LLC</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-.02em" }}>{tr("nav_projects")}</h1>
        </div>
        <button onClick={onNewProject} style={{ background: "#F59E0B", color: "#0A0F1E", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{tr("new_project")}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[[tr("portfolio_value"), fmt(totalVal), `${projects.length} ${tr("contracts")}`],
          [tr("total_invoiced"), fmt(totalInv), `${Math.round(totalInv/totalVal*100)}${tr("of_portfolio")}`],
          [tr("active_projects"), projects.filter(p=>p.status==="active").length, tr("currently_running")]
        ].map(([l,v,s],i) => (
          <Card key={i}>
            <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", marginBottom: 2 }}>{v}</div>
            <div style={{ fontSize: 11, color: "#4B5563" }}>{s}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1E2D3D", marginBottom: 20, overflowX: "auto" }}>
        {[["all",tr("all"),projects.length],["active",tr("active"),projects.filter(p=>p.status==="active").length],["on_hold",tr("on_hold"),projects.filter(p=>p.status==="on_hold").length],["completed",tr("completed"),projects.filter(p=>p.status==="completed").length]].map(([v,l,n])=>(
          <Tab key={v} label={l} active={filter===v} onClick={()=>setFilter(v)} n={n} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map(p => {
          const progress = pct(p.invoicedItems, p.totalItems);
          const invVal = Math.round(progress/100*p.contractValue);
          return (
            <Card key={p.id} onClick={() => onSelect(p)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ paddingRight: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>📍 {p.address}</div>
                </div>
                <Badge status={p.status} config={SC.project} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#94A3B8" }}><span style={{ color: "#F1F5F9", fontWeight: 700 }}>{fmt(invVal)}</span> {tr("invoiced_of")} {fmt(p.contractValue)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: progress===100?"#10B981":"#F59E0B" }}>{progress}%</div>
              </div>
              <Bar value={progress} color={p.status==="completed"?"#10B981":"#F59E0B"} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontSize: 11, color: "#4B5563" }}>GC: {p.gc}</div>
                <div style={{ fontSize: 11, color: "#4B5563" }}>{p.invoicedItems} / {p.totalItems} {tr("units_invoiced")}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN 2 — PROJECT DETAIL (buildings list) ───────────────────────────────

function S2_Project({ project: p, onBack, onBuilding, tr, lang }) {
  const [tab, setTab] = useState("buildings");
  const SC = STATUS_CFG(tr);
  const progress = pct(p.invoicedItems, p.totalItems);
  const invVal = Math.round(progress/100*p.contractValue);
  const coTotal = p.changeOrders.filter(c=>c.status==="approved").reduce((s,c)=>s+c.amount,0);
  const contractTotal = p.contractValue + coTotal;
  const retainage = Math.round(invVal*(p.retainage/100));
  const net = invVal - retainage;
  const received = p.payments.reduce((s,pay)=>s+pay.amount,0);

  return (
    <div>
      <BackBtn onClick={onBack} label={tr("back_projects")} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ paddingRight: 12 }}>
          <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{p.contractNum}</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#F1F5F9" }}>{p.name}</h2>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>📍 {p.address}</div>
        </div>
        <Badge status={p.status} config={SC.project} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[[tr("gc_contact"), p.gcContact, p.gcEmail],[tr("timeline"), p.startDate, `${tr("due")} ${p.endDate}`]].map(([l,m,s],i)=>(
          <div key={i} style={{ background: "#0D1B2A", borderRadius: 8, padding: "11px 13px" }}>
            <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{m}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0D1B2A", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>{tr("overall_progress")}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#F59E0B" }}>{progress}{tr("invoiced_pct")}</span>
        </div>
        <Bar value={progress} h={8} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#4B5563" }}>{p.invoicedItems} {tr("of")} {p.totalItems} {tr("units_invoiced")}</span>
          <span style={{ fontSize: 11, color: "#4B5563" }}>{fmt(invVal)} {tr("of")} {fmt(contractTotal)}</span>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1E2D3D", marginBottom: 20, overflowX: "auto" }}>
        <Tab label={tr("buildings")} active={tab==="buildings"} onClick={()=>setTab("buildings")} n={p.buildings.length} />
        <Tab label={tr("change_orders")} active={tab==="co"} onClick={()=>setTab("co")} n={p.changeOrders.length} />
        <Tab label={tr("financials")} active={tab==="finance"} onClick={()=>setTab("finance")} />
        <Tab label={tr("files")} active={tab==="files"} onClick={()=>setTab("files")} />
      </div>

      {/* BUILDINGS TAB */}
      {tab === "buildings" && (
        <div>
          <SectionLabel>{tr("buildings")}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {p.buildings.map(b => {
              const bp = bldgProgress(b);
              const pendingUnits = b.units.filter(u => u.invoicedItems > 0 && u.invoicedItems < u.totalItems).length;
              return (
                <Card key={b.id} onClick={() => onBuilding(b)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 3 }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>
                        {b.units.length} {tr("units")}
                        {pendingUnits > 0 && <span style={{ color: "#F59E0B", marginLeft: 8 }}>· {pendingUnits} {tr("pending_review_short")}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: bp.pct===100?"#10B981":"#F59E0B" }}>{bp.pct}%</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{bp.inv}/{bp.total} {tr("items")}</div>
                    </div>
                  </div>
                  <Bar value={bp.pct} color={bp.pct===100?"#10B981":"#F59E0B"} />
                  {/* Unit pip row */}
                  <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                    {b.units.map(u => {
                      const s = unitStatus(u);
                      const col = s==="invoiced"?"#3B82F6":s==="in_progress"?"#F59E0B":"#1F2937";
                      return <div key={u.id} title={u.name} style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />;
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* SITE & COMMON AREAS */}
          {p.siteItems.length > 0 && (
            <div>
              <SectionLabel>{tr("site_common")}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.siteItems.map(item => (
                  <Card key={item.id} style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{loc(lang, item.label, item.labelEs)}</div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{fmt(item.amount)} · {tr("lump_sum")}</div>
                      </div>
                      <Badge status={item.status} config={SC.lineitem} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHANGE ORDERS TAB */}
      {tab === "co" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{tr("co_note")}</div>
            <button style={{ background: "#F59E0B", color: "#0A0F1E", border: "none", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{tr("add_co")}</button>
          </div>
          {p.changeOrders.length === 0
            ? <div style={{ textAlign: "center", padding: "40px 0", color: "#4B5563" }}>{tr("no_cos")}</div>
            : p.changeOrders.map(co => (
              <Card key={co.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B" }}>{co.coNum}</span>
                      <Badge status={co.status} config={SC.co} />
                    </div>
                    <div style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 4 }}>{co.description}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{tr("submitted")} {co.date}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9" }}>{fmt(co.amount)}</div>
                </div>
              </Card>
            ))
          }
          {coTotal > 0 && (
            <div style={{ background: "#0D1B2A", borderRadius: 8, padding: "12px 16px", marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>{tr("total_approved_cos")}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>{fmt(coTotal)}</span>
            </div>
          )}
        </div>
      )}

      {/* FINANCIALS TAB */}
      {tab === "finance" && (
        <div>
          {[
            [tr("base_contract"), fmt(p.contractValue), "#94A3B8"],
            [tr("approved_cos"), fmt(coTotal), "#10B981"],
            [tr("total_contract"), fmt(contractTotal), "#F1F5F9", true], null,
            [tr("total_inv_label"), fmt(invVal), "#94A3B8"],
            [tr("retainage_held"), `− ${fmt(retainage)}`, "#EF4444"],
            [tr("net_billed"), fmt(net), "#F1F5F9", true], null,
            [tr("payments_received"), fmt(received), "#10B981"],
            [tr("outstanding"), fmt(net-received), "#F59E0B", true], null,
            [tr("remaining_uninvoiced"), fmt(contractTotal-invVal), "#6B7280"],
            [tr("retainage_release"), fmt(retainage), "#6B7280"],
          ].map((row,i) => {
            if (!row) return <HR key={i} />;
            const [l,v,c,bold] = row;
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px", borderBottom: bold?"1px solid #1E2D3D":"none" }}>
                <span style={{ fontSize: 13, color: "#6B7280", fontWeight: bold?700:400 }}>{l}</span>
                <span style={{ fontSize: 13, color: c, fontWeight: bold?800:600 }}>{v}</span>
              </div>
            );
          })}
          <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", margin: "22px 0 12px" }}>{tr("payment_log")}</div>
          {p.payments.map(pay => (
            <Card key={pay.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{pay.type}</div><div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{pay.date} · {pay.ref}</div></div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#10B981" }}>{fmt(pay.amount)}</div>
              </div>
            </Card>
          ))}
          <button style={{ width: "100%", background: "none", border: "1px dashed #2D3F55", borderRadius: 8, padding: 12, color: "#6B7280", fontSize: 13, cursor: "pointer", marginTop: 8 }}>{tr("record_manual")}</button>
        </div>
      )}

      {/* FILES TAB */}
      {tab === "files" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["SCD2602-008 Subcontract Agreement.pdf","Contract"],["Pickens Gardens Specification Book.pdf","Architecture"],["Project Schedule — Exhibit A.6.pdf","Schedule"],["Davis-Bacon Wage Decision SC2026.pdf","Compliance"]].map(([name,type],i)=>(
            <Card key={i}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", gap: 12, alignItems: "center" }}><div style={{ background: "#0D1B2A", borderRadius: 8, padding: "8px 10px", fontSize: 18 }}>📄</div><div><div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{name}</div><div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{type}</div></div></div><span style={{ color: "#4B5563" }}>↓</span></div></Card>
          ))}
          <button style={{ width: "100%", background: "none", border: "1px dashed #2D3F55", borderRadius: 8, padding: 12, color: "#6B7280", fontSize: 13, cursor: "pointer" }}>{tr("upload_file")}</button>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN 3 — BUILDING DETAIL (unit list) ───────────────────────────────────

function S3_Building({ building: b, project, onBack, onUnit, tr, lang }) {
  const SC = STATUS_CFG(tr);
  const bp = bldgProgress(b);

  return (
    <div>
      <BackBtn onClick={onBack} label={project.name.split(" ")[0] + "…"} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{project.name}</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#F1F5F9" }}>{b.name}</h2>
        <div style={{ fontSize: 12, color: "#6B7280" }}>{b.units.length} {tr("units")}</div>
      </div>

      <div style={{ background: "#0D1B2A", borderRadius: 10, padding: "13px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>{tr("overall_progress")}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: bp.pct===100?"#10B981":"#F59E0B" }}>{bp.pct}%</span>
        </div>
        <Bar value={bp.pct} color={bp.pct===100?"#10B981":"#F59E0B"} h={7} />
        <div style={{ fontSize: 11, color: "#4B5563", marginTop: 8 }}>{bp.inv} {tr("of")} {bp.total} {tr("items")} {tr("invoiced").toLowerCase()}</div>
      </div>

      <SectionLabel>{tr("units")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {b.units.map(u => {
          const st = unitStatus(u);
          const up = pct(u.invoicedItems, u.totalItems);
          return (
            <Card key={u.id} onClick={() => onUnit(u)} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{u.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                    <span style={{ background: "#0D1B2A", color: "#94A3B8", fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{u.type}</span>
                    <span style={{ fontSize: 11, color: "#6B7280" }}>{u.invoicedItems}/{u.totalItems} {tr("items")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <Badge status={st} config={SC.unit} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: up===100?"#10B981":"#F59E0B" }}>{up}%</span>
                </div>
              </div>
              <Bar value={up} color={up===100?"#10B981":"#F59E0B"} h={4} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN 4 — UNIT DETAIL (cluster folders) ─────────────────────────────────

function S4_Unit({ unit: u, building: b, project, onBack, onCluster, tr, lang }) {
  const SC = STATUS_CFG(tr);
  const [allItems, setAllItems] = useState([]);
  const [dbGroups, setDbGroups] = useState([]);
  const up = pct(u.invoicedItems, u.totalItems);

  useEffect(() => {
    supabase
      .from('line_item_groups')
      .select('*, line_items(*)')
      .eq('project_id', project.id)
      .then(({ data, error }) => {
        if (error) { console.error(error); return; }
        if (data && data.length > 0) {
          setDbGroups(data);
          const items = data.flatMap(g =>
            (g.line_items || []).map(item => ({
              id: item.id,
              groupId: g.id,
              label: item.label,
              labelEs: item.label_es || item.label,
              unitPrice: item.unit_price,
              status: 'not_started',
              photos: 0,
            }))
          );
          setAllItems(items);
        } else {
          const fallback = UNIT_LINE_ITEMS[u.id] || UNIT_LINE_ITEMS[303] || [];
          setAllItems(fallback);
        }
      });
  }, [u.id, project.id]);

  // Group items by groupId
  const clustersMap = {};
  allItems.forEach(item => {
    if (!clustersMap[item.groupId]) clustersMap[item.groupId] = [];
    clustersMap[item.groupId].push(item);
  });
  const groupSource = dbGroups.length > 0
  ? dbGroups.map(g => ({ id: g.id, name: g.name, nameEs: g.name, costCode: g.cost_code }))
  : GROUPS;
const clusters = groupSource.filter(g => clustersMap[g.id]).map(g => ({ group: g, items: clustersMap[g.id] }));

  const statusColor = (st) => ({ invoiced:"#3B82F6", approved:"#10B981", pending_review:"#F59E0B", not_started:"#374151" })[st] || "#374151";

  return (
    <div>
      <BackBtn onClick={onBack} label={b.name} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{b.name} · {project.name.split(" ")[0]}…</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#F1F5F9" }}>{u.name}</h2>
            <span style={{ background: "#0D1B2A", color: "#94A3B8", fontSize: 12, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>{u.type}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: up===100?"#10B981":"#F59E0B" }}>{up}%</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{u.invoicedItems}/{u.totalItems} {tr("items")}</div>
          </div>
        </div>
      </div>

      <Bar value={up} color={up===100?"#10B981":"#F59E0B"} h={6} />

      {/* Status dots legend */}
      <div style={{ display: "flex", gap: 16, margin: "14px 0 20px", flexWrap: "wrap" }}>
        {[["#3B82F6", tr("s_invoiced")],["#10B981", tr("s_approved")],["#F59E0B", tr("s_pending")],["#374151", tr("s_not_started")]].map(([c,l])=>(
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 11, color: "#6B7280" }}>{l}</span>
          </div>
        ))}
      </div>

      <SectionLabel>{tr("all_clusters")}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clusters.map(({ group: g, items }) => {
          const inv = items.filter(i=>i.status==="invoiced").length;
          const clusterPct = pct(inv, items.length);
          const groupName = loc(lang, g.name, g.nameEs);

          return (
            <Card key={g.id} onClick={() => onCluster({ group: g, items })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>{groupName}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{g.costCode} · {items.length} {tr("items")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: clusterPct===100?"#10B981":"#F59E0B" }}>{clusterPct}%</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{inv}/{items.length}</div>
                </div>
              </div>
              {/* Item status pips */}
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {items.map(item => (
                  <div key={item.id} title={loc(lang, item.label, item.labelEs)} style={{ width: 10, height: 10, borderRadius: 3, background: statusColor(item.status) }} />
                ))}
              </div>
              <Bar value={clusterPct} color={clusterPct===100?"#10B981":"#F59E0B"} h={4} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN 5 — CLUSTER DETAIL (line items in this unit) ──────────────────────

function S5_Cluster({ cluster: { group: g, items }, unit: u, building: b, onBack, onItem, tr, lang }) {
  const SC = STATUS_CFG(tr);
  const inv = items.filter(i=>i.status==="invoiced").length;
  const groupName = loc(lang, g.name, g.nameEs);

  return (
    <div>
      <BackBtn onClick={onBack} label={u.name} />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{u.name} · {b.name}</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#F1F5F9" }}>{groupName}</h2>
        <div style={{ fontSize: 12, color: "#6B7280" }}>{g.costCode} · {inv}/{items.length} {tr("invoiced").toLowerCase()}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(item => {
          const itemLabel = loc(lang, item.label, item.labelEs);
          return (
            <Card key={item.id} onClick={() => onItem(item)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ paddingRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>{itemLabel}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>{fmt(item.unitPrice)}{tr("unit_price")}</span>
                    {item.photos > 0 && <span style={{ fontSize: 11, color: "#6B7280" }}>📸 {item.photos} {item.photos===1?tr("photo"):tr("photos")}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <Badge status={item.status} config={SC.lineitem} />
                  <span style={{ fontSize: 11, color: "#4B5563" }}>→</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN 6 — LINE ITEM DETAIL ─────────────────────────────────────────────

function S6_LineItem({ item, cluster: { group: g }, unit: u, building: b, onBack, tr, lang }) {
  const [modal, setModal] = useState(false);
  const SC = STATUS_CFG(tr);
  const itemLabel = loc(lang, item.label, item.labelEs);
  const groupName = loc(lang, g.name, g.nameEs);
  const photoColors = ["#1E3A2F","#1A2E3D","#2D2014","#1F1A2E"];

  return (
    <div>
      <BackBtn onClick={onBack} label={groupName} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ paddingRight: 12 }}>
          <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{groupName} · {u.name}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#F1F5F9" }}>{itemLabel}</h2>
        </div>
        <Badge status={item.status} config={SC.lineitem} />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Price", fmt(item.unitPrice)],[tr("building_label"), b.name],[tr("unit_type"), u.type],["Cost Code", g.costCode]].map(([l,v],i)=>(
            <div key={i}><div style={{ fontSize: 11, color: "#4B5563", marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>{v}</div></div>
          ))}
        </div>
      </Card>

      <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>{tr("photo_doc")} ({item.photos})</div>

      {item.photos > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
          {Array.from({length:item.photos}).map((_,i)=>(
            <div key={i} style={{ aspectRatio:"1", borderRadius: 8, background: photoColors[i%4], display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:"1px solid #1E2D3D", position:"relative" }}>
              <div style={{ fontSize:24 }}>📸</div>
              <div style={{ fontSize:10, color:"#6B7280", marginTop:4 }}>Photo {i+1}</div>
              <div style={{ position:"absolute", bottom:4, right:4, background:"#00000088", borderRadius:4, padding:"2px 5px", fontSize:10, color:"#94A3B8" }}>Apr 18 · 9:42am</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:"#0D1B2A", borderRadius:10, padding:32, textAlign:"center", marginBottom:16, border:"1px dashed #2D3F55" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📷</div>
          <div style={{ fontSize:13, color:"#6B7280" }}>{tr("no_photos")}</div>
        </div>
      )}

      {item.status==="not_started" && <button style={{ width:"100%", background:"#F59E0B", color:"#0A0F1E", border:"none", borderRadius:10, padding:14, fontWeight:800, fontSize:15, cursor:"pointer", marginBottom:10 }}>{tr("submit_photos")}</button>}
      {item.status==="pending_review" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <button style={{ background:"#10B981", color:"#fff", border:"none", borderRadius:10, padding:13, fontWeight:700, fontSize:13, cursor:"pointer" }}>{tr("approve")}</button>
          <button style={{ background:"#1F2937", color:"#EF4444", border:"1px solid #EF444444", borderRadius:10, padding:13, fontWeight:700, fontSize:13, cursor:"pointer" }}>{tr("request_redo")}</button>
        </div>
      )}
      {item.status==="approved" && <button onClick={()=>setModal(true)} style={{ width:"100%", background:"#3B82F6", color:"#fff", border:"none", borderRadius:10, padding:14, fontWeight:800, fontSize:15, cursor:"pointer", marginBottom:10 }}>{tr("mark_invoiced")}</button>}
      {item.status==="invoiced" && (
        <div style={{ background:"#0D1B2A", borderRadius:10, padding:14, border:"1px solid #1E3A5F", textAlign:"center" }}>
          <div style={{ color:"#93C5FD", fontSize:13, fontWeight:700 }}>{tr("invoiced_locked")}</div>
          <div style={{ color:"#4B5563", fontSize:11, marginTop:4 }}>{tr("invoiced_locked_sub")}</div>
        </div>
      )}

      {modal && (
        <div style={{ position:"fixed", inset:0, background:"#000000AA", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
          <div style={{ background:"#111827", border:"1px solid #1E2D3D", borderRadius:16, padding:24, width:"100%", maxWidth:360 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#F1F5F9", marginBottom:6 }}>{tr("mark_invoiced_title")}</div>
            <div style={{ fontSize:13, color:"#6B7280", marginBottom:20 }}>{tr("mark_invoiced_note")}</div>
            <label style={{ fontSize:11, color:"#6B7280", display:"block", marginBottom:6 }}>{tr("invoice_ref")}</label>
            <input placeholder={tr("invoice_placeholder")} style={{ width:"100%", background:"#0D1B2A", border:"1px solid #1E2D3D", borderRadius:8, padding:"10px 12px", color:"#F1F5F9", fontSize:13, boxSizing:"border-box", marginBottom:20 }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={()=>setModal(false)} style={{ background:"#1F2937", border:"none", borderRadius:8, padding:12, color:"#94A3B8", fontWeight:700, fontSize:13, cursor:"pointer" }}>{tr("cancel")}</button>
              <button onClick={()=>setModal(false)} style={{ background:"#3B82F6", border:"none", borderRadius:8, padding:12, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>{tr("confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState("en");
  const [screen, setScreen] = useState("s1");
  const [proj, setProj] = useState(null);
  const [bldg, setBldg] = useState(null);
  const [unit, setUnit] = useState(null);
  const [cluster, setCluster] = useState(null);
  const [lineItem, setLineItem] = useState(null);
  const [dbProjects, setDbProjects] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const tr = t(lang);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*, buildings(*, units(*)), site_items(*), change_orders(*), payments(*)')
      .then(({ data, error }) => {
        if (error) { console.error('Supabase error:', error); return; }
        if (data && data.length > 0) {
          const normalized = data.map(p => ({
            ...p,
            contractValue: p.contract_value,
            contractNum: p.contract_num,
            gcContact: p.gc_contact,
            gcEmail: p.gc_email,
            startDate: p.start_date,
            endDate: p.end_date,
            totalItems: p.buildings?.reduce((s, b) => s + (b.units?.length || 0), 0) || 0,
            invoicedItems: 0,
            siteItems: (p.site_items || []).map(i => ({ ...i, labelEs: i.label_es })),
            changeOrders: (p.change_orders || []).map(c => ({ ...c, coNum: c.co_num })),
            payments: p.payments || [],
            buildings: (p.buildings || []).map(b => ({
              ...b,
              units: (b.units || []).map(u => ({
                ...u,
                type: u.unit_type,
                totalItems: 13,
                invoicedItems: 0,
              }))
            }))
          }));
          setDbProjects(normalized);
        }
      });
  }, []);

  const activeProjects = dbProjects || PROJECTS;
  const go = {
    s1: () => { setScreen("s1"); setProj(null); setBldg(null); setUnit(null); setCluster(null); setLineItem(null); },
    s2: (p) => { setProj(p); setScreen("s2"); },
    s3: (b) => { setBldg(b); setScreen("s3"); },
    s4: (u) => { setUnit(u); setScreen("s4"); },
    s5: (c) => { setCluster(c); setScreen("s5"); },
    s6: (i) => { setLineItem(i); setScreen("s6"); },
    back2: () => { setBldg(null); setUnit(null); setCluster(null); setLineItem(null); setScreen("s2"); },
    back3: () => { setUnit(null); setCluster(null); setLineItem(null); setScreen("s3"); },
    back4: () => { setCluster(null); setLineItem(null); setScreen("s4"); },
    back5: () => { setLineItem(null); setScreen("s5"); },
  };

  const crumbs = [
    { label: tr("nav_projects"), onClick: go.s1 },
    proj && screen!=="s1" && { label: proj.name.split(" ")[0]+"…", onClick: go.back2 },
    bldg && ["s3","s4","s5","s6"].includes(screen) && { label: bldg.name, onClick: go.back3 },
    unit && ["s4","s5","s6"].includes(screen) && { label: unit.name, onClick: go.back4 },
    cluster && ["s5","s6"].includes(screen) && { label: loc(lang, cluster.group.name, cluster.group.nameEs), onClick: go.back5 },
    lineItem && screen==="s6" && { label: loc(lang, lineItem.label, lineItem.labelEs) },
  ].filter(Boolean);

  return (
    <div style={{ fontFamily:"'Barlow','DM Sans',system-ui,sans-serif", background:"#0A0F1E", minHeight:"100vh", color:"#F1F5F9" }}>
      <div style={{ background:"#0D1320", borderBottom:"1px solid #1E2D3D", padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ background:"#F59E0B", width:28, height:28, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🏗</div>
          <span style={{ fontSize:14, fontWeight:800, color:"#F1F5F9" }}>FieldTrack</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <LangToggle lang={lang} setLang={setLang} />
          <button style={{ background:"none", border:"none", color:"#6B7280", fontSize:16, padding:"5px 6px", cursor:"pointer" }}>🔔</button>
          <button style={{ background:"none", border:"none", color:"#6B7280", fontSize:16, padding:"5px 6px", cursor:"pointer" }}>👤</button>
        </div>
      </div>

      {crumbs.length > 1 && (
        <div style={{ padding:"10px 20px 0", display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          {crumbs.map((c,i)=>(
            <span key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
              {i>0 && <span style={{ color:"#2D3F55", fontSize:12 }}>›</span>}
              <span onClick={c.onClick} style={{ fontSize:11, color:i===crumbs.length-1?"#F59E0B":"#6B7280", cursor:c.onClick?"pointer":"default", fontWeight:i===crumbs.length-1?700:400 }}>{c.label}</span>
            </span>
          ))}
        </div>
      )}

      <div style={{ padding:"20px 20px 48px", maxWidth:640, margin:"0 auto" }}>
        {screen==="s1" && <S1_Projects onSelect={go.s2} tr={tr} lang={lang} projects={activeProjects} onNewProject={() => setShowWizard(true)} />}
        {screen==="s2" && proj && <S2_Project project={proj} onBack={go.s1} onBuilding={go.s3} tr={tr} lang={lang} />}
        {screen==="s3" && bldg && <S3_Building building={bldg} project={proj} onBack={go.back2} onUnit={go.s4} tr={tr} lang={lang} />}
        {screen==="s4" && unit && <S4_Unit unit={unit} building={bldg} project={proj} onBack={go.back3} onCluster={go.s5} tr={tr} lang={lang} />}
        {screen==="s5" && cluster && <S5_Cluster cluster={cluster} unit={unit} building={bldg} onBack={go.back4} onItem={go.s6} tr={tr} lang={lang} />}
        {screen==="s6" && lineItem && <S6_LineItem item={lineItem} cluster={cluster} unit={unit} building={bldg} onBack={go.back5} tr={tr} lang={lang} />}
      </div>
      {showWizard && <NewProjectWizard onClose={() => setShowWizard(false)} onSaved={() => { setShowWizard(false); window.location.reload(); }} />}
    </div>
  );
}