"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import NewProjectWizard from "@/app/NewProjectWizard";
import EditProjectModal from "@/app/EditProjectModal";

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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const SC = STATUS_CFG(tr);

  const nonArchived = projects.filter(p => p.status !== "archived");
  const archived = projects.filter(p => p.status === "archived");
  const visible = filter === "archived" ? archived
    : filter === "all" ? nonArchived
    : nonArchived.filter(p => p.status === filter);

  const totalVal = nonArchived.reduce((s, p) => s + (p.contract_value || p.contractValue || 0), 0);
  const totalInv = nonArchived.reduce((s, p) => s + pct(p.invoicedItems || 0, p.totalItems || 1) / 100 * (p.contract_value || p.contractValue || 0), 0);

  const handleRecover = async (p) => {
    await supabase.from('projects').update({ status: 'active' }).eq('id', p.id);
    window.location.reload();
  };

  const handlePermDelete = async (p) => {
    await supabase.from('projects').delete().eq('id', p.id);
    setDeleteConfirm(null);
    window.location.reload();
  };

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
        {[[tr("portfolio_value"), fmt(totalVal), `${nonArchived.length} ${tr("contracts")}`],
          [tr("total_invoiced"), fmt(totalInv), `${totalVal > 0 ? Math.round(totalInv/totalVal*100) : 0}${tr("of_portfolio")}`],
          [tr("active_projects"), nonArchived.filter(p=>p.status==="active").length, tr("currently_running")]
        ].map(([l,v,s],i) => (
          <Card key={i}>
            <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", marginBottom: 2 }}>{v}</div>
            <div style={{ fontSize: 11, color: "#4B5563" }}>{s}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1E2D3D", marginBottom: 20, overflowX: "auto" }}>
        {[
          ["all", tr("all"), nonArchived.length],
          ["active", tr("active"), nonArchived.filter(p=>p.status==="active").length],
          ["on_hold", tr("on_hold"), nonArchived.filter(p=>p.status==="on_hold").length],
          ["completed", tr("completed"), nonArchived.filter(p=>p.status==="completed").length],
          ["archived", tr("s_archived"), archived.length],
        ].map(([v,l,n]) => (
          <Tab key={v} label={l} active={filter===v} onClick={()=>{ setFilter(v); setDeleteConfirm(null); }} n={n} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map(p => {
          const progress = pct(p.invoicedItems, p.totalItems);
          const invVal = Math.round(progress/100*(p.contractValue||p.contract_value||0));
          const isArchived = p.status === "archived";
          const pendingDelete = deleteConfirm === p.id;

          return (
            <Card key={p.id} onClick={isArchived ? undefined : () => onSelect(p)}
              style={{ opacity: isArchived ? 0.75 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ paddingRight: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>📍 {p.address}</div>
                </div>
                <Badge status={p.status} config={SC.project} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#94A3B8" }}><span style={{ color: "#F1F5F9", fontWeight: 700 }}>{fmt(invVal)}</span> {tr("invoiced_of")} {fmt(p.contractValue||p.contract_value||0)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280" }}>{progress}%</div>
              </div>
              <Bar value={progress} color="#4B5563" />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontSize: 11, color: "#4B5563" }}>GC: {p.gc}</div>
                <div style={{ fontSize: 11, color: "#4B5563" }}>{p.invoicedItems} / {p.totalItems} {tr("units_invoiced")}</div>
              </div>
              {isArchived && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #1E2D3D" }}>
                  <button onClick={e => { e.stopPropagation(); handleRecover(p); }}
                    style={{ flex: 1, background: "#064E3B", border: "none", borderRadius: 8, padding: "9px 0", color: "#6EE7B7", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    ↩ Recover
                  </button>
                  {!pendingDelete ? (
                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                      style={{ flex: 1, background: "#1F2937", border: "1px solid #EF444433", borderRadius: 8, padding: "9px 0", color: "#EF4444", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      🗑 Delete
                    </button>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); handlePermDelete(p); }}
                      style={{ flex: 1, background: "#7F1D1D", border: "1px solid #EF4444", borderRadius: 8, padding: "9px 0", color: "#FCA5A5", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      Confirm Delete
                    </button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN 2 — PROJECT DETAIL ────────────────────────────────────────────────

function S2_Project({ project: p, onBack, onBuilding, tr, lang, onEdit, onArchive }) {
  const [tab, setTab] = useState("buildings");
  const SC = STATUS_CFG(tr);

  // Change orders live in local state so the create flow + financials stay in sync
  const [cos, setCos] = useState(p.changeOrders || []);
  const [showCoForm, setShowCoForm] = useState(false);
  const [coForm, setCoForm] = useState({ co_num: '', description: '', amount: '' });
  const [coSaving, setCoSaving] = useState(false);

  const progress = pct(p.invoicedItems, p.totalItems);
  const invVal = Math.round(progress/100*p.contractValue);
  const coTotal = cos.filter(c => c.status === "approved").reduce((s,c) => s + Number(c.amount||0), 0);
  const contractTotal = p.contractValue + coTotal;
  const retainage = Math.round(invVal*(p.retainage/100));
  const net = invVal - retainage;
  const received = p.payments.reduce((s,pay) => s + pay.amount, 0);

  const handleStatusChange = async (newStatus) => {
    await supabase.from('projects').update({ status: newStatus }).eq('id', p.id);
    window.location.reload();
  };

  const handleCreateCo = async () => {
    if (!coForm.co_num.trim() || !coForm.amount) return;
    setCoSaving(true);
    const { data } = await supabase.from('change_orders').insert([{
      project_id: p.id,
      co_num: coForm.co_num,
      description: coForm.description,
      amount: Number(coForm.amount) || 0,
      status: 'draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }]).select().single();
    if (data) setCos(prev => [...prev, { ...data, coNum: data.co_num }]);
    setCoForm({ co_num: '', description: '', amount: '' });
    setShowCoForm(false);
    setCoSaving(false);
  };

  const handleCoStatus = async (co, newStatus) => {
    await supabase.from('change_orders').update({ status: newStatus }).eq('id', co.id);
    setCos(prev => prev.map(c => c.id === co.id ? { ...c, status: newStatus } : c));
  };

  const coNextStatus = { draft: 'submitted', submitted: 'approved' };
  const coNextLabel = { draft: 'Submit to GC', submitted: 'Mark Approved' };

  return (
    <div>
      <BackBtn onClick={onBack} label={tr("back_projects")} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ paddingRight: 12 }}>
          <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{p.contractNum}</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#F1F5F9" }}>{p.name}</h2>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>📍 {p.address}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <Badge status={p.status} config={SC.project} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onEdit} style={{ background: "#1F2937", border: "none", borderRadius: 7, padding: "6px 12px", color: "#F1F5F9", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✏️ Edit</button>
            <button onClick={onArchive} style={{ background: "#1F2937", border: "none", borderRadius: 7, padding: "6px 12px", color: "#F59E0B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📦 Archive</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["active","on_hold","completed"].map(s => (
              <button key={s} onClick={() => p.status !== s && handleStatusChange(s)}
                style={{ background: p.status===s ? STATUS_CFG(tr).project[s]?.bg : "#1F2937", color: p.status===s ? STATUS_CFG(tr).project[s]?.text : "#6B7280", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: p.status===s?"default":"pointer" }}>
                {STATUS_CFG(tr).project[s]?.label}
              </button>
            ))}
          </div>
        </div>
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
        <Tab label={tr("change_orders")} active={tab==="co"} onClick={()=>setTab("co")} n={cos.length} />
        <Tab label={tr("financials")} active={tab==="finance"} onClick={()=>setTab("finance")} />
        <Tab label="Contacts" active={tab==="contacts"} onClick={()=>setTab("contacts")} />
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
            <button onClick={() => setShowCoForm(!showCoForm)} style={{ background: "#F59E0B", color: "#0A0F1E", border: "none", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{tr("add_co")}</button>
          </div>

          {showCoForm && (
            <div style={{ background: "#0D1B2A", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #1E2D3D" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 14 }}>New Change Order</div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, display: "block", marginBottom: 4 }}>CO Number *</label>
                <input value={coForm.co_num} onChange={e => setCoForm(c => ({ ...c, co_num: e.target.value }))} placeholder="e.g. CO-003"
                  style={{ width: "100%", background: "#111827", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, display: "block", marginBottom: 4 }}>Description</label>
                <textarea value={coForm.description} onChange={e => setCoForm(c => ({ ...c, description: e.target.value }))} placeholder="What does this change order cover?" rows={2}
                  style={{ width: "100%", background: "#111827", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box", resize: "none" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, display: "block", marginBottom: 4 }}>Amount ($) *</label>
                <input value={coForm.amount} onChange={e => setCoForm(c => ({ ...c, amount: e.target.value }))} type="number" placeholder="e.g. 2400"
                  style={{ width: "100%", background: "#111827", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => { setShowCoForm(false); setCoForm({ co_num: '', description: '', amount: '' }); }} style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: 10, color: "#94A3B8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreateCo} disabled={coSaving} style={{ background: "#10B981", border: "none", borderRadius: 8, padding: 10, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: coSaving ? 0.7 : 1 }}>{coSaving ? "Saving..." : "Create CO"}</button>
              </div>
            </div>
          )}

          {cos.length === 0 && !showCoForm
            ? <div style={{ textAlign: "center", padding: "40px 0", color: "#4B5563" }}>{tr("no_cos")}</div>
            : cos.map(co => (
              <Card key={co.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B" }}>{co.coNum || co.co_num}</span>
                      <Badge status={co.status} config={SC.co} />
                    </div>
                    {co.description && <div style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 4 }}>{co.description}</div>}
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{co.date}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9" }}>{fmt(Number(co.amount||0))}</div>
                </div>
                {coNextStatus[co.status] && (
                  <button onClick={() => handleCoStatus(co, coNextStatus[co.status])}
                    style={{ width: "100%", background: "#1F2937", border: "1px solid #2D3F55", borderRadius: 8, padding: "8px 0", color: "#F59E0B", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    {coNextLabel[co.status]} →
                  </button>
                )}
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

      {/* CONTACTS TAB */}
      {tab === "contacts" && <ContactsTab projectId={p.id} />}

      {/* FILES TAB */}
      {tab === "files" && <FilesTab projectId={p.id} />}
    </div>
  );
}

// ─── SCREEN 3 — BUILDING DETAIL ───────────────────────────────────────────────

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

// ─── SCREEN 4 — UNIT DETAIL ───────────────────────────────────────────────────

function S4_Unit({ unit: u, building: b, project, onBack, onCluster, tr, lang }) {
  const SC = STATUS_CFG(tr);
  const [allItems, setAllItems] = useState([]);
  const [dbGroups, setDbGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: groupData, error }, { data: uliData }] = await Promise.all([
        supabase.from('line_item_groups').select('*, line_items(*)').eq('project_id', project.id),
        supabase.from('unit_line_items').select('*').eq('unit_id', u.id)
      ]);
      if (error) { console.error(error); return; }
      const uliMap = {};
      (uliData || []).forEach(r => { uliMap[r.line_item_id] = r; });
      if (groupData && groupData.length > 0) {
        setDbGroups(groupData);
        setAllItems(groupData.flatMap(g =>
          (g.line_items || []).map(item => {
            const uli = uliMap[item.id];
            return {
              id: item.id, groupId: g.id,
              label: item.label, labelEs: item.label_es || item.label,
              unitPrice: item.unit_price,
              status: uli?.status || 'not_started',
              photos: 0,
            };
          })
        ));
      } else {
        setAllItems(UNIT_LINE_ITEMS[u.id] || UNIT_LINE_ITEMS[303] || []);
      }
    };
    fetchData();
  }, [u.id, project.id]);

  const clustersMap = {};
  allItems.forEach(item => {
    if (!clustersMap[item.groupId]) clustersMap[item.groupId] = [];
    clustersMap[item.groupId].push(item);
  });
  const groupSource = dbGroups.length > 0
    ? dbGroups.map(g => ({ id: g.id, name: g.name, nameEs: g.name, costCode: g.cost_code }))
    : GROUPS;
  const clusters = groupSource.filter(g => clustersMap[g.id]).map(g => ({ group: g, items: clustersMap[g.id] }));

  const invoicedCount = allItems.filter(i => i.status === 'invoiced').length;
  const up = pct(invoicedCount, allItems.length || 1);

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
            <div style={{ fontSize: 11, color: "#6B7280" }}>{invoicedCount}/{allItems.length} {tr("items")}</div>
          </div>
        </div>
      </div>
      <Bar value={up} color={up===100?"#10B981":"#F59E0B"} h={6} />
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

// ─── SCREEN 5 — CLUSTER DETAIL ────────────────────────────────────────────────

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

// ─── SCREEN 6 — LINE ITEM DETAIL ──────────────────────────────────────────────

function S6_LineItem({ item, cluster: { group: g }, unit: u, building: b, onBack, tr, lang }) {
  const [status, setStatus] = useState(item.status);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [invoiceRef, setInvoiceRef] = useState('');
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [gpsLat, setGpsLat] = useState(null);
  const [gpsLng, setGpsLng] = useState(null);
  const [uploading, setUploading] = useState(false);
  const SC = STATUS_CFG(tr);
  const itemLabel = loc(lang, item.label, item.labelEs);
  const groupName = loc(lang, g.name, g.nameEs);

  useEffect(() => {
    supabase.from('photos').select('*')
      .eq('unit_id', u.id).eq('line_item_id', item.id)
      .order('submitted_at', { ascending: false })
      .then(({ data }) => setPhotos(data || []));
  }, [u.id, item.id]);

  useEffect(() => {
    if (submitModal && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [submitModal]);

  const saveStatus = async (newStatus, extra = {}) => {
    setSaving(true);
    const { data: existing } = await supabase
      .from('unit_line_items').select('id')
      .eq('unit_id', u.id).eq('line_item_id', item.id).single();
    if (existing) {
      await supabase.from('unit_line_items').update({ status: newStatus, ...extra }).eq('id', existing.id);
    } else {
      await supabase.from('unit_line_items').insert([{ unit_id: u.id, line_item_id: item.id, status: newStatus, ...extra }]);
    }
    setStatus(newStatus);
    setSaving(false);
  };

  const handleApprove = () => saveStatus('approved');
  const handleRedo = () => saveStatus('not_started');
  const handleInvoice = async () => {
    await saveStatus('invoiced', { invoice_ref: invoiceRef, invoiced_at: new Date().toISOString() });
    setInvoiceModal(false);
  };

  const handleSubmitPhotos = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const { data: existing } = await supabase
        .from('unit_line_items').select('id')
        .eq('unit_id', u.id).eq('line_item_id', item.id).single();
      let uliId;
      if (existing) {
        await supabase.from('unit_line_items').update({ status: 'pending_review' }).eq('id', existing.id);
        uliId = existing.id;
      } else {
        const { data: newUli } = await supabase.from('unit_line_items')
          .insert([{ unit_id: u.id, line_item_id: item.id, status: 'pending_review' }]).select().single();
        uliId = newUli?.id;
      }
      for (const file of selectedFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${u.id}/${item.id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from('photos').upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { error: photoErr } = await supabase.from('photos').insert([{
  unit_line_item_id: uliId, unit_id: u.id, line_item_id: item.id,
  storage_path: path, notes: notes || null,
  gps_lat: gpsLat, gps_lng: gpsLng,
  submitted_at: new Date().toISOString(),
}]);
if (photoErr) throw photoErr;
      }
      const { data: newPhotos } = await supabase.from('photos').select('*')
        .eq('unit_id', u.id).eq('line_item_id', item.id).order('submitted_at', { ascending: false });
      setPhotos(newPhotos || []);
      setStatus('pending_review');
      setSubmitModal(false);
      setSelectedFiles([]);
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <BackBtn onClick={onBack} label={groupName} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ paddingRight: 12 }}>
          <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{groupName} · {u.name}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#F1F5F9" }}>{itemLabel}</h2>
        </div>
        <Badge status={status} config={SC.lineitem} />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Price", fmt(item.unitPrice)],[tr("building_label"), b.name],[tr("unit_type"), u.type],["Cost Code", g.costCode]].map(([l,v],i)=>(
            <div key={i}><div style={{ fontSize: 11, color: "#4B5563", marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>{v}</div></div>
          ))}
        </div>
      </Card>

      <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>{tr("photo_doc")} ({photos.length})</div>

      {photos.length > 0 ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
            {photos.map(photo => {
              const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(photo.storage_path);
              return (
                <div key={photo.id} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", background: "#0D1B2A", position: "relative" }}>
                  <img src={publicUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 4, right: 4, background: "#00000088", borderRadius: 4, padding: "2px 5px", fontSize: 10, color: "#94A3B8" }}>
                    {new Date(photo.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
          {photos[0]?.notes && (
            <div style={{ background: "#0D1B2A", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "#94A3B8" }}>
              💬 {photos[0].notes}
            </div>
          )}
          {photos[0]?.gps_lat && (
            <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 16 }}>
              📍 {Number(photos[0].gps_lat).toFixed(4)}, {Number(photos[0].gps_lng).toFixed(4)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#0D1B2A", borderRadius: 10, padding: 32, textAlign: "center", marginBottom: 16, border: "1px dashed #2D3F55" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>{tr("no_photos")}</div>
        </div>
      )}

      {status === "not_started" && <button onClick={() => setSubmitModal(true)} style={{ width: "100%", background: "#F59E0B", color: "#0A0F1E", border: "none", borderRadius: 10, padding: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 10 }}>{tr("submit_photos")}</button>}
      {status === "pending_review" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <button onClick={handleApprove} disabled={saving} style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "..." : tr("approve")}</button>
          <button onClick={handleRedo} disabled={saving} style={{ background: "#1F2937", color: "#EF4444", border: "1px solid #EF444444", borderRadius: 10, padding: 13, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "..." : tr("request_redo")}</button>
        </div>
      )}
      {status === "approved" && <button onClick={() => setInvoiceModal(true)} style={{ width: "100%", background: "#3B82F6", color: "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 10 }}>{tr("mark_invoiced")}</button>}
      {status === "invoiced" && (
        <div style={{ background: "#0D1B2A", borderRadius: 10, padding: 14, border: "1px solid #1E3A5F", textAlign: "center" }}>
          <div style={{ color: "#93C5FD", fontSize: 13, fontWeight: 700 }}>{tr("invoiced_locked")}</div>
          <div style={{ color: "#4B5563", fontSize: 11, marginTop: 4 }}>{tr("invoiced_locked_sub")}</div>
        </div>
      )}

      {submitModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000BB", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 600, paddingBottom: 40 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9", marginBottom: 4 }}>Submit Photos</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>{itemLabel} · {u.name}</div>
            <label style={{ display: "block", background: "#0D1B2A", border: "1px dashed #2D3F55", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", marginBottom: 16 }}>
              <input type="file" accept="image/*" multiple capture="environment" style={{ display: "none" }} onChange={e => setSelectedFiles(Array.from(e.target.files))} />
              <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
              <div style={{ fontSize: 13, color: selectedFiles.length > 0 ? "#10B981" : "#6B7280", fontWeight: 600 }}>
                {selectedFiles.length > 0 ? `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} selected` : "Tap to take or select photos"}
              </div>
            </label>
            <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Used 2x4 blocking per spec..." rows={3}
              style={{ width: "100%", background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box", resize: "none", marginBottom: 8 }} />
            <div style={{ fontSize: 11, color: gpsLat ? "#10B981" : "#6B7280", marginBottom: 20 }}>
              {gpsLat ? `📍 GPS captured: ${gpsLat.toFixed(4)}, ${gpsLng.toFixed(4)}` : "📍 Capturing GPS..."}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => { setSubmitModal(false); setSelectedFiles([]); setNotes(''); }}
                style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: 12, color: "#94A3B8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSubmitPhotos} disabled={uploading || selectedFiles.length === 0}
                style={{ background: selectedFiles.length > 0 ? "#F59E0B" : "#374151", border: "none", borderRadius: 8, padding: 12, color: selectedFiles.length > 0 ? "#0A0F1E" : "#6B7280", fontWeight: 700, fontSize: 13, cursor: selectedFiles.length > 0 ? "pointer" : "default", opacity: uploading ? 0.7 : 1 }}>
                {uploading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {invoiceModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000AA", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", marginBottom: 6 }}>{tr("mark_invoiced_title")}</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>{tr("mark_invoiced_note")}</div>
            <label style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 6 }}>{tr("invoice_ref")}</label>
            <input value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)} placeholder={tr("invoice_placeholder")}
              style={{ width: "100%", background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box", marginBottom: 20 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => setInvoiceModal(false)} style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: 12, color: "#94A3B8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{tr("cancel")}</button>
              <button onClick={handleInvoice} disabled={saving} style={{ background: "#3B82F6", border: "none", borderRadius: 8, padding: 12, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : tr("confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REVIEW FEED ──────────────────────────────────────────────────────────────

function ContactsTab({ projectId }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', phone: '', email: '' });
  const f = key => val => setForm(c => ({ ...c, [key]: val }));

  useEffect(() => {
    supabase.from('contacts').select('*').eq('project_id', projectId)
      .order('name').then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, [projectId]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const { data } = await supabase.from('contacts')
      .insert([{ project_id: projectId, ...form }]).select().single();
    if (data) setContacts(c => [...c, data]);
    setForm({ name: '', role: '', phone: '', email: '' });
    setShowAdd(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('contacts').delete().eq('id', id);
    setContacts(c => c.filter(x => x.id !== id));
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ background: "#F59E0B", color: "#0A0F1E", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          + Add Contact
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "#0D1B2A", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #1E2D3D" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 14 }}>New Contact</div>
          {[["Name *", "name", "text"], ["Role", "role", "text"], ["Phone", "phone", "tel"], ["Email", "email", "email"]].map(([label, key, type]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, display: "block", marginBottom: 4 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => f(key)(e.target.value)}
                style={{ width: "100%", background: "#111827", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <button onClick={() => { setShowAdd(false); setForm({ name: '', role: '', phone: '', email: '' }); }}
              style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: 10, color: "#94A3B8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              style={{ background: "#10B981", border: "none", borderRadius: 8, padding: 10, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {contacts.length === 0 && !showAdd && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#4B5563" }}>No contacts yet.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {contacts.map(c => (
          <div key={c.id} style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>{c.name}</div>
                {c.role && <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600, marginBottom: 8 }}>{c.role}</div>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {c.phone && (
                    <a href={`tel:${c.phone}`}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "#064E3B", color: "#6EE7B7", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                      📞 {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "#1E3A5F", color: "#93C5FD", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                      ✉️ {c.email}
                    </a>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)}
                style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer", fontSize: 16, padding: "0 0 0 12px" }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilesTab({ projectId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from('files').select('*').eq('project_id', projectId)
      .order('uploaded_at', { ascending: false })
      .then(({ data }) => { setFiles(data || []); setLoading(false); });
  }, [projectId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${projectId}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from('files').upload(path, file, { contentType: file.type });
    if (upErr) { alert('Upload failed: ' + upErr.message); setUploading(false); return; }
    const { data } = await supabase.from('files').insert([{
      project_id: projectId, name: file.name, storage_path: path,
      file_type: file.type, size_bytes: file.size, visibility: 'everyone'
    }]).select().single();
    if (data) setFiles(f => [data, ...f]);
    e.target.value = '';
    setUploading(false);
  };

  const handleVisibility = async (fileId, visibility) => {
    await supabase.from('files').update({ visibility }).eq('id', fileId);
    setFiles(f => f.map(x => x.id === fileId ? { ...x, visibility } : x));
  };

  const handleDelete = async (file) => {
    await supabase.storage.from('files').remove([file.storage_path]);
    await supabase.from('files').delete().eq('id', file.id);
    setFiles(f => f.filter(x => x.id !== file.id));
  };

  const getUrl = (path) => supabase.storage.from('files').getPublicUrl(path).data.publicUrl;

  const fileIcon = (type) => {
    if (!type) return '📎';
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1048576).toFixed(1)} MB`;
  };

  const visibilityColor = { everyone: '#6B7280', admin_owner: '#F59E0B', owner_only: '#3B82F6' };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {files.map(file => (
        <div key={file.id} style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ background: "#0D1B2A", borderRadius: 8, padding: "10px 12px", fontSize: 22, flexShrink: 0 }}>
              {fileIcon(file.file_type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
              <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 10 }}>
                {fmtSize(file.size_bytes)} · {new Date(file.uploaded_at).toLocaleDateString()}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select value={file.visibility} onChange={e => handleVisibility(file.id, e.target.value)}
                  style={{ background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 6, padding: "4px 8px", color: visibilityColor[file.visibility] || "#6B7280", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  <option value="everyone">🌐 Everyone</option>
                  <option value="admin_owner">🔒 Admin & Owner</option>
                  <option value="owner_only">👁 Owner Only</option>
                </select>
                <a href={getUrl(file.storage_path)} target="_blank" rel="noreferrer"
                  style={{ background: "#1F2937", color: "#94A3B8", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                  ↓ Download
                </a>
                <button onClick={() => handleDelete(file)}
                  style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer", fontSize: 12, padding: "4px 4px" }}>🗑</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {files.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#4B5563" }}>No files uploaded yet.</div>
      )}

      <label style={{ display: "block", background: "none", border: "1px dashed #2D3F55", borderRadius: 8, padding: 14, textAlign: "center", cursor: uploading ? "default" : "pointer" }}>
        <input type="file" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
        <span style={{ color: "#6B7280", fontSize: 13 }}>{uploading ? "Uploading..." : "+ Upload File"}</span>
      </label>
    </div>
  );
}

function S_Review({ onClose, tr, lang }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    supabase.from('unit_line_items')
      .select('*, units(name, unit_type), line_items(label, unit_price), photos(*)')
      .eq('status', 'pending_review')
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  const handleAction = async (item, newStatus) => {
    setSaving(item.id);
    await supabase.from('unit_line_items').update({ status: newStatus }).eq('id', item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
    setSaving(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0A0F1E", zIndex: 150, overflowY: "auto" }}>
      <div style={{ background: "#0D1320", borderBottom: "1px solid #1E2D3D", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#F59E0B", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔍</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#F1F5F9" }}>Pending Review</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ padding: "20px 20px 48px", maxWidth: 640, margin: "0 auto" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Loading submissions...</div>}
        {!loading && items.length === 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ color: "#F1F5F9", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>All caught up</div>
            <div style={{ color: "#6B7280", fontSize: 13 }}>No pending photo submissions</div>
          </div>
        )}
        {items.map(item => {
          const unit = item.units;
          const lineItem = item.line_items;
          const itemPhotos = item.photos || [];
          return (
            <Card key={item.id} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>
                {unit?.name} · {unit?.unit_type}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>{lineItem?.label}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: itemPhotos.length > 0 ? 12 : 8 }}>
                {fmt(lineItem?.unit_price || 0)} · {itemPhotos.length} photo{itemPhotos.length !== 1 ? 's' : ''}
              </div>
              {itemPhotos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
                  {itemPhotos.slice(0, 6).map(photo => {
                    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(photo.storage_path);
                    return (
                      <div key={photo.id} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", background: "#0D1B2A" }}>
                        <img src={publicUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    );
                  })}
                </div>
              )}
              {itemPhotos[0]?.notes && (
                <div style={{ background: "#0D1B2A", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "#94A3B8" }}>
                  💬 {itemPhotos[0].notes}
                </div>
              )}
              {itemPhotos[0]?.submitted_at && (
                <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 12 }}>
                  📅 {new Date(itemPhotos[0].submitted_at).toLocaleString()}
                  {itemPhotos[0].gps_lat && ` · 📍 ${Number(itemPhotos[0].gps_lat).toFixed(4)}, ${Number(itemPhotos[0].gps_lng).toFixed(4)}`}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => handleAction(item, 'approved')} disabled={saving === item.id}
                  style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving === item.id ? 0.7 : 1 }}>
                  {saving === item.id ? "..." : "✓ Approve"}
                </button>
                <button onClick={() => handleAction(item, 'not_started')} disabled={saving === item.id}
                  style={{ background: "#1F2937", color: "#EF4444", border: "1px solid #EF444433", borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving === item.id ? 0.7 : 1 }}>
                  {saving === item.id ? "..." : "✗ Request Redo"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
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
  const [showReview, setShowReview] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [archiveConfirm, setArchiveConfirm] = useState(null);
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
          <button onClick={() => setShowReview(true)} style={{ background:"none", border:"none", color:"#6B7280", fontSize:16, padding:"5px 6px", cursor:"pointer" }}>🔔</button>
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
        {screen==="s2" && proj && <S2_Project project={proj} onBack={go.s1} onBuilding={go.s3} tr={tr} lang={lang} onEdit={() => setEditProject(proj)} onArchive={() => setArchiveConfirm(proj)} />}
        {screen==="s3" && bldg && <S3_Building building={bldg} project={proj} onBack={go.back2} onUnit={go.s4} tr={tr} lang={lang} />}
        {screen==="s4" && unit && <S4_Unit unit={unit} building={bldg} project={proj} onBack={go.back3} onCluster={go.s5} tr={tr} lang={lang} />}
        {screen==="s5" && cluster && <S5_Cluster cluster={cluster} unit={unit} building={bldg} onBack={go.back4} onItem={go.s6} tr={tr} lang={lang} />}
        {screen==="s6" && lineItem && <S6_LineItem item={lineItem} cluster={cluster} unit={unit} building={bldg} onBack={go.back5} tr={tr} lang={lang} />}
      </div>

      {showWizard && <NewProjectWizard onClose={() => setShowWizard(false)} onSaved={() => { setShowWizard(false); window.location.reload(); }} />}
      {showReview && <S_Review onClose={() => setShowReview(false)} tr={tr} lang={lang} />}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSaved={() => { setEditProject(null); window.location.reload(); }}
        />
      )}
      {archiveConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "#000000CC", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", marginBottom: 8 }}>Archive Project?</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>{archiveConfirm.name} will be hidden from your projects list. You can recover it from the Archived tab.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => setArchiveConfirm(null)} style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: 12, color: "#94A3B8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={async () => {
                await supabase.from('projects').update({ status: 'archived' }).eq('id', archiveConfirm.id);
                setArchiveConfirm(null);
                window.location.reload();
              }} style={{ background: "#F59E0B", border: "none", borderRadius: 8, padding: 12, color: "#0A0F1E", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
