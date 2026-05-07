"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const UNIT_TYPES = ["Studio","1BR","1BR E","1BR ADA","2BR","2BR ADA","3BR","4BR","4BR ADA","Other"];

const Card = ({ children, style: s = {} }) => (
  <div style={{ background: "#111827", border: "1px solid #1E2D3D", borderRadius: 12, padding: "16px 18px", ...s }}>{children}</div>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box" }} />
  </div>
);

const Btn = ({ children, onClick, color = "#F59E0B", textColor = "#0A0F1E", style: s = {} }) => (
  <button onClick={onClick} style={{ background: color, color: textColor, border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", ...s }}>{children}</button>
);

// ─── STEP 1 — PROJECT INFO ────────────────────────────────────────────────────
function Step1({ data, setData }) {
  const f = (key) => (val) => setData(d => ({ ...d, [key]: val }));
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", marginBottom: 20 }}>Project Info</div>
      <Input label="Project Name" value={data.name} onChange={f("name")} placeholder="e.g. Pickens Gardens Apartments" />
      <Input label="Address" value={data.address} onChange={f("address")} placeholder="e.g. 102 Garden Drive, Pickens, SC 29671" />
      <Input label="GC Name" value={data.gc} onChange={f("gc")} placeholder="e.g. Dominion Construction Group" />
      <Input label="GC Contact" value={data.gc_contact} onChange={f("gc_contact")} placeholder="e.g. Andrew Sutherland" />
      <Input label="GC Email" value={data.gc_email} onChange={f("gc_email")} placeholder="e.g. subcontracts@email.com" />
      <Input label="Contract Number" value={data.contract_num} onChange={f("contract_num")} placeholder="e.g. SCD2602-008" />
      <Input label="Contract Value ($)" value={data.contract_value} onChange={f("contract_value")} type="number" placeholder="e.g. 224888" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Start Date" value={data.start_date} onChange={f("start_date")} placeholder="e.g. Apr 8, 2026" />
        <Input label="End Date" value={data.end_date} onChange={f("end_date")} placeholder="e.g. Nov 1, 2026" />
      </div>
      <Input label="Retainage %" value={data.retainage} onChange={f("retainage")} type="number" placeholder="e.g. 10" />
    </div>
  );
}

// ─── STEP 2 — BUILDINGS ───────────────────────────────────────────────────────
function Step2({ buildings, setBuildings }) {
  const addBuilding = () => setBuildings(b => [...b, { tempId: Date.now(), name: "" }]);
  const updateName = (tempId, name) => setBuildings(b => b.map(x => x.tempId === tempId ? { ...x, name } : x));
  const removeBuilding = (tempId) => setBuildings(b => b.filter(x => x.tempId !== tempId));

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", marginBottom: 6 }}>Buildings</div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Add all buildings in this project.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {buildings.map((b, i) => (
          <div key={b.tempId} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={b.name} onChange={e => updateName(b.tempId, e.target.value)}
              placeholder={`Building name (e.g. Building ${102 + i * 6})`}
              style={{ flex: 1, background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#F1F5F9", fontSize: 13 }} />
            <button onClick={() => removeBuilding(b.tempId)}
              style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: "10px 12px", color: "#EF4444", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        ))}
      </div>
      <Btn onClick={addBuilding} color="#1F2937" textColor="#F59E0B">+ Add Building</Btn>
    </div>
  );
}

// ─── STEP 3 — UNITS ───────────────────────────────────────────────────────────
function Step3({ buildings, units, setUnits }) {
  const addUnit = (buildingTempId) => setUnits(u => [...u, { tempId: Date.now(), buildingTempId, name: "", unit_type: "1BR" }]);
  const updateUnit = (tempId, key, val) => setUnits(u => u.map(x => x.tempId === tempId ? { ...x, [key]: val } : x));
  const removeUnit = (tempId) => setUnits(u => u.filter(x => x.tempId !== tempId));

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", marginBottom: 6 }}>Units</div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Add units for each building.</div>
      {buildings.map(b => (
        <div key={b.tempId} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 10 }}>{b.name || "Unnamed Building"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {units.filter(u => u.buildingTempId === b.tempId).map(u => (
              <div key={u.tempId} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={u.name} onChange={e => updateUnit(u.tempId, "name", e.target.value)}
                  placeholder="Unit name (e.g. Apt 102-A)"
                  style={{ flex: 1, background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13 }} />
                <select value={u.unit_type} onChange={e => updateUnit(u.tempId, "unit_type", e.target.value)}
                  style={{ background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 10px", color: "#F1F5F9", fontSize: 13 }}>
                  {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={() => removeUnit(u.tempId)}
                  style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: "9px 12px", color: "#EF4444", cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </div>
          <Btn onClick={() => addUnit(b.tempId)} color="#1F2937" textColor="#F59E0B" style={{ fontSize: 12 }}>+ Add Unit to {b.name || "Building"}</Btn>
        </div>
      ))}
    </div>
  );
}

// ─── STEP 4 — LINE ITEMS ──────────────────────────────────────────────────────
function Step4({ lineItemGroups, setLineItemGroups, units }) {
  const addGroup = () => setLineItemGroups(g => [...g, { tempId: Date.now(), name: "", cost_code: "", items: [] }]);
  const updateGroup = (tempId, key, val) => setLineItemGroups(g => g.map(x => x.tempId === tempId ? { ...x, [key]: val } : x));
  const removeGroup = (tempId) => setLineItemGroups(g => g.filter(x => x.tempId !== tempId));

  const addItem = (groupTempId) => setLineItemGroups(g => g.map(x => x.tempId === groupTempId ? {
    ...x, items: [...x.items, { tempId: Date.now(), label: "", label_es: "", unit_price: "", applies_to: "all", unit_types: [] }]
  } : x));

  const updateItem = (groupTempId, itemTempId, key, val) => setLineItemGroups(g => g.map(x => x.tempId === groupTempId ? {
    ...x, items: x.items.map(i => i.tempId === itemTempId ? { ...i, [key]: val } : i)
  } : x));

  const removeItem = (groupTempId, itemTempId) => setLineItemGroups(g => g.map(x => x.tempId === groupTempId ? {
    ...x, items: x.items.filter(i => i.tempId !== itemTempId)
  } : x));

  const allUnitTypes = [...new Set(units.map(u => u.unit_type).filter(Boolean))];

  const toggleUnitType = (groupTempId, itemTempId, unitType) => {
    setLineItemGroups(g => g.map(x => x.tempId === groupTempId ? {
      ...x, items: x.items.map(i => {
        if (i.tempId !== itemTempId) return i;
        const types = i.unit_types.includes(unitType)
          ? i.unit_types.filter(t => t !== unitType)
          : [...i.unit_types, unitType];
        return { ...i, unit_types: types };
      })
    } : x));
  };

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", marginBottom: 6 }}>Line Items</div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Create line item groups and add items to each.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
        {lineItemGroups.map(g => (
          <Card key={g.tempId}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <input value={g.name} onChange={e => updateGroup(g.tempId, "name", e.target.value)}
                placeholder="Group name (e.g. Framing)"
                style={{ flex: 2, background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13 }} />
              <input value={g.cost_code} onChange={e => updateGroup(g.tempId, "cost_code", e.target.value)}
                placeholder="Cost code (e.g. 06-100)"
                style={{ flex: 1, background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13 }} />
              <button onClick={() => removeGroup(g.tempId)}
                style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: "9px 12px", color: "#EF4444", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
              {g.items.map(item => (
                <div key={item.tempId} style={{ background: "#0D1B2A", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input value={item.label} onChange={e => updateItem(g.tempId, item.tempId, "label", e.target.value)}
                      placeholder="Line item name"
                      style={{ flex: 2, background: "#111827", border: "1px solid #1E2D3D", borderRadius: 6, padding: "8px 10px", color: "#F1F5F9", fontSize: 12 }} />
                    <input value={item.unit_price} onChange={e => updateItem(g.tempId, item.tempId, "unit_price", e.target.value)}
                      placeholder="$ price" type="number"
                      style={{ flex: 1, background: "#111827", border: "1px solid #1E2D3D", borderRadius: 6, padding: "8px 10px", color: "#F1F5F9", fontSize: 12 }} />
                    <button onClick={() => removeItem(g.tempId, item.tempId)}
                      style={{ background: "#1F2937", border: "none", borderRadius: 6, padding: "8px 10px", color: "#EF4444", cursor: "pointer", fontSize: 12 }}>✕</button>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "#6B7280" }}>Applies to:</span>
                    <button onClick={() => updateItem(g.tempId, item.tempId, "applies_to", "all")}
                      style={{ background: item.applies_to === "all" ? "#F59E0B" : "#1F2937", color: item.applies_to === "all" ? "#0A0F1E" : "#9CA3AF", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>All Units</button>
                    <button onClick={() => updateItem(g.tempId, item.tempId, "applies_to", "specific")}
                      style={{ background: item.applies_to === "specific" ? "#F59E0B" : "#1F2937", color: item.applies_to === "specific" ? "#0A0F1E" : "#9CA3AF", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Specific Types</button>
                    {item.applies_to === "specific" && allUnitTypes.map(type => (
                      <button key={type} onClick={() => toggleUnitType(g.tempId, item.tempId, type)}
                        style={{ background: item.unit_types.includes(type) ? "#3B82F6" : "#1F2937", color: item.unit_types.includes(type) ? "#fff" : "#9CA3AF", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{type}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Btn onClick={() => addItem(g.tempId)} color="#1F2937" textColor="#F59E0B" style={{ fontSize: 12 }}>+ Add Line Item</Btn>
          </Card>
        ))}
      </div>
      <Btn onClick={addGroup}>+ Add Line Item Group</Btn>
    </div>
  );
}

// ─── STEP 5 — REVIEW ─────────────────────────────────────────────────────────
function Step5({ projectData, buildings, units, lineItemGroups }) {
  const totalUnits = units.length;
  const totalItems = lineItemGroups.reduce((s, g) => s + g.items.length, 0);
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", marginBottom: 20 }}>Review & Confirm</div>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 10 }}>Project Info</div>
        {[["Name", projectData.name],["Address", projectData.address],["GC", projectData.gc],["Contact", projectData.gc_contact],["Contract #", projectData.contract_num],["Value", `$${Number(projectData.contract_value || 0).toLocaleString()}`],["Retainage", `${projectData.retainage}%`]].map(([l,v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #1E2D3D" }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>{l}</span>
            <span style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </Card>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 10 }}>Buildings & Units</div>
        {buildings.map(b => (
          <div key={b.tempId} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{b.name}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{units.filter(u => u.buildingTempId === b.tempId).length} units</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "#4B5563", marginTop: 8 }}>{totalUnits} total units</div>
      </Card>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 10 }}>Line Items</div>
        {lineItemGroups.map(g => (
          <div key={g.tempId} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{g.name} <span style={{ color: "#6B7280", fontSize: 11 }}>{g.cost_code}</span></div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{g.items.length} items</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "#4B5563", marginTop: 8 }}>{totalItems} total line items</div>
      </Card>
    </div>
  );
}

// ─── SAVE TO SUPABASE ─────────────────────────────────────────────────────────
async function saveProject(projectData, buildings, units, lineItemGroups, onSuccess, onError, setSaving) {
  setSaving(true);
  try {
    const { data: proj, error: projErr } = await supabase
      .from('projects')
      .insert([{
        name: projectData.name,
        address: projectData.address,
        gc: projectData.gc,
        gc_contact: projectData.gc_contact,
        gc_email: projectData.gc_email,
        contract_num: projectData.contract_num,
        contract_value: Number(projectData.contract_value) || 0,
        status: 'active',
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        retainage: Number(projectData.retainage) || 10,
      }])
      .select()
      .single();
    if (projErr) throw projErr;

    const projectId = proj.id;
    const buildingIdMap = {};

    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      const { data: bldg, error: bErr } = await supabase
        .from('buildings')
        .insert([{ project_id: projectId, name: b.name, display_order: i + 1 }])
        .select().single();
      if (bErr) throw bErr;
      buildingIdMap[b.tempId] = bldg.id;
    }

    for (const u of units) {
      const { error: uErr } = await supabase
        .from('units')
        .insert([{ project_id: projectId, building_id: buildingIdMap[u.buildingTempId], name: u.name, unit_type: u.unit_type }]);
      if (uErr) throw uErr;
    }

    for (let i = 0; i < lineItemGroups.length; i++) {
      const g = lineItemGroups[i];
      const { data: grp, error: gErr } = await supabase
        .from('line_item_groups')
        .insert([{ project_id: projectId, name: g.name, cost_code: g.cost_code, display_order: i + 1 }])
        .select().single();
      if (gErr) throw gErr;

      for (const item of g.items) {
        const { error: iErr } = await supabase
          .from('line_items')
          .insert([{
            group_id: grp.id,
            label: item.label,
            label_es: item.label_es || null,
            unit_price: Number(item.unit_price) || 0,
            unit_type: item.applies_to === "specific" ? item.unit_types.join(",") : null,
          }]);
        if (iErr) throw iErr;
      }
    }

    onSuccess();
  } catch (err) {
    console.error(err);
    onError(err.message);
  } finally {
    setSaving(false);
  }
}

// ─── MAIN WIZARD ─────────────────────────────────────────────────────────────
export default function NewProjectWizard({ onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [projectData, setProjectData] = useState({
    name: "", address: "", gc: "", gc_contact: "", gc_email: "",
    contract_num: "", contract_value: "", start_date: "", end_date: "", retainage: "10"
  });
  const [buildings, setBuildings] = useState([{ tempId: Date.now(), name: "" }]);
  const [units, setUnits] = useState([]);
  const [lineItemGroups, setLineItemGroups] = useState([]);

  const steps = ["Project Info", "Buildings", "Units", "Line Items", "Review"];

  const handleSave = () => {
    saveProject(projectData, buildings, units, lineItemGroups, onSaved, setError, setSaving);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000CC", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "20px 16px 48px" }}>
      <div style={{ background: "#0A0F1E", border: "1px solid #1E2D3D", borderRadius: 16, width: "100%", maxWidth: 600, marginTop: 20 }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #1E2D3D" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9" }}>New Project</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", padding: "14px 20px", borderBottom: "1px solid #1E2D3D", gap: 6, overflowX: "auto" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: step > i + 1 ? "#10B981" : step === i + 1 ? "#F59E0B" : "#1F2937", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: step >= i + 1 ? "#0A0F1E" : "#6B7280" }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 11, color: step === i + 1 ? "#F59E0B" : "#6B7280", fontWeight: step === i + 1 ? 700 : 400 }}>{s}</span>
              {i < steps.length - 1 && <span style={{ color: "#2D3F55", fontSize: 12 }}>›</span>}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ padding: 20 }}>
          {step === 1 && <Step1 data={projectData} setData={setProjectData} />}
          {step === 2 && <Step2 buildings={buildings} setBuildings={setBuildings} />}
          {step === 3 && <Step3 buildings={buildings} units={units} setUnits={setUnits} />}
          {step === 4 && <Step4 lineItemGroups={lineItemGroups} setLineItemGroups={setLineItemGroups} units={units} />}
          {step === 5 && <Step5 projectData={projectData} buildings={buildings} units={units} lineItemGroups={lineItemGroups} />}
          {error && <div style={{ background: "#2D1B1B", border: "1px solid #EF4444", borderRadius: 8, padding: 12, color: "#EF4444", fontSize: 13, marginTop: 16 }}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid #1E2D3D" }}>
          <Btn onClick={step === 1 ? onClose : () => setStep(s => s - 1)} color="#1F2937" textColor="#94A3B8">
            {step === 1 ? "Cancel" : "← Back"}
          </Btn>
          {step < 5
            ? <Btn onClick={() => setStep(s => s + 1)}>Next →</Btn>
            : <Btn onClick={handleSave} color="#10B981" textColor="#fff" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "✓ Create Project"}
              </Btn>
          }
        </div>
      </div>
    </div>
  );
}