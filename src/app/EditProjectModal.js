"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const UNIT_TYPES = ["Studio","1BR","1BR E","1BR ADA","2BR","2BR ADA","3BR","4BR","4BR ADA","Other"];

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 12px", color: "#F1F5F9", fontSize: 13, boxSizing: "border-box" }}
    />
  </div>
);

const Btn = ({ children, onClick, color = "#F59E0B", textColor = "#0A0F1E", style: s = {} }) => (
  <button onClick={onClick} style={{ background: color, color: textColor, border: "none", borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", ...s }}>
    {children}
  </button>
);

function BuildingsTab({ buildings, setBuildings, units, setUnits }) {
  const addBuilding = () => {
    const tempId = `new-${Date.now()}`;
    setBuildings(b => [...b, { id: tempId, name: "", isNew: true, deleted: false }]);
  };

  const visibleBuildings = buildings.filter(b => !b.deleted);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {visibleBuildings.map(b => (
          <div key={b.id}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input
                value={b.name}
                onChange={e => setBuildings(bs => bs.map(x => x.id === b.id ? { ...x, name: e.target.value } : x))}
                placeholder="Building name"
                style={{ flex: 1, background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13 }}
              />
              <button
                onClick={() => setBuildings(bs => bs.map(x => x.id === b.id ? { ...x, deleted: true } : x))}
                style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: "9px 12px", color: "#EF4444", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginLeft: 16, display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
              {units.filter(u => u.buildingId === b.id && !u.deleted).map(u => (
                <div key={u.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    value={u.name}
                    onChange={e => setUnits(us => us.map(x => x.id === u.id ? { ...x, name: e.target.value } : x))}
                    placeholder="Unit name"
                    style={{ flex: 1, background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 6, padding: "7px 10px", color: "#F1F5F9", fontSize: 12 }}
                  />

                  <select
                    value={u.unit_type}
                    onChange={e => setUnits(us => us.map(x => x.id === u.id ? { ...x, unit_type: e.target.value } : x))}
                    style={{ background: "#0D1B2A", border: "1px solid #1E2D3D", borderRadius: 6, padding: "7px 8px", color: "#F1F5F9", fontSize: 12 }}
                  >
                    {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>

                  <button
                    onClick={() => setUnits(us => us.map(x => x.id === u.id ? { ...x, deleted: true } : x))}
                    style={{ background: "#1F2937", border: "none", borderRadius: 6, padding: "7px 10px", color: "#EF4444", cursor: "pointer", fontSize: 12 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setUnits(us => [...us, { id: `new-${Date.now()}`, buildingId: b.id, name: "", unit_type: "1BR", isNew: true, deleted: false }])}
              style={{ marginLeft: 16, background: "none", border: "none", color: "#F59E0B", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
            >
              + Add Unit
            </button>
          </div>
        ))}
      </div>

      <Btn onClick={addBuilding} color="#1F2937" textColor="#F59E0B">
        + Add Building
      </Btn>
    </div>
  );
}

function LineItemsTab({ groups, setGroups }) {
  const addGroup = () => {
    setGroups(g => [...g, { id: `new-${Date.now()}`, name: "", cost_code: "", isNew: true, deleted: false, items: [] }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.filter(g => !g.deleted).map(g => (
        <div key={g.id} style={{ background: "#0D1B2A", borderRadius: 10, padding: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              value={g.name}
              onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, name: e.target.value } : x))}
              placeholder="Group name"
              style={{ flex: 2, background: "#111827", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 10px", color: "#F1F5F9", fontSize: 13 }}
            />

            <input
              value={g.cost_code}
              onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, cost_code: e.target.value } : x))}
              placeholder="Cost code"
              style={{ flex: 1, background: "#111827", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 10px", color: "#F1F5F9", fontSize: 13 }}
            />

            <button
              onClick={() => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, deleted: true } : x))}
              style={{ background: "#1F2937", border: "none", borderRadius: 8, padding: "8px 12px", color: "#EF4444", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
            {g.items.filter(i => !i.deleted).map(item => (
              <div key={item.id} style={{ display: "flex", gap: 6 }}>
                <input
                  value={item.label}
                  onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, items: x.items.map(i => i.id === item.id ? { ...i, label: e.target.value } : i) } : x))}
                  placeholder="Item name"
                  style={{ flex: 2, background: "#111827", border: "1px solid #1E2D3D", borderRadius: 6, padding: "7px 10px", color: "#F1F5F9", fontSize: 12 }}
                />

                <input
                  value={item.unit_price}
                  onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, items: x.items.map(i => i.id === item.id ? { ...i, unit_price: e.target.value } : i) } : x))}
                  placeholder="$"
                  type="number"
                  style={{ width: 70, background: "#111827", border: "1px solid #1E2D3D", borderRadius: 6, padding: "7px 10px", color: "#F1F5F9", fontSize: 12 }}
                />

                <button
                  onClick={() => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, items: x.items.map(i => i.id === item.id ? { ...i, deleted: true } : i) } : x))}
                  style={{ background: "#1F2937", border: "none", borderRadius: 6, padding: "7px 10px", color: "#EF4444", cursor: "pointer", fontSize: 12 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, items: [...x.items, { id: `new-${Date.now()}`, label: "", unit_price: "", isNew: true, deleted: false }] } : x))}
            style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
          >
            + Add Line Item
          </button>
        </div>
      ))}

      <Btn onClick={addGroup} color="#1F2937" textColor="#F59E0B">
        + Add Group
      </Btn>
    </div>
  );
}

export default function EditProjectModal({ project, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("info");

  const [info, setInfo] = useState({
    name: project.name || "",
    address: project.address || "",
    gc: project.gc || "",
    gc_contact: project.gcContact || project.gc_contact || "",
    gc_email: project.gcEmail || project.gc_email || "",
    contract_num: project.contractNum || project.contract_num || "",
    contract_value: project.contractValue || project.contract_value || "",
    start_date: project.startDate || project.start_date || "",
    end_date: project.endDate || project.end_date || "",
    retainage: project.retainage || 10,
  });

  const [buildings, setBuildings] = useState(
    (project.buildings || []).map(b => ({ id: b.id, name: b.name, isNew: false, deleted: false }))
  );

  const [units, setUnits] = useState(
    (project.buildings || []).flatMap(b =>
      (b.units || []).map(u => ({
        id: u.id,
        buildingId: b.id,
        name: u.name,
        unit_type: u.type || u.unit_type || "1BR",
        isNew: false,
        deleted: false
      }))
    )
  );

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    supabase
      .from("line_item_groups")
      .select("*, line_items(*)")
      .eq("project_id", project.id)
      .then(({ data }) => {
        if (data) {
          setGroups(data.map(g => ({
            id: g.id,
            name: g.name,
            cost_code: g.cost_code || "",
            isNew: false,
            deleted: false,
            items: (g.line_items || []).map(i => ({
              id: i.id,
              label: i.label,
              unit_price: i.unit_price,
              isNew: false,
              deleted: false
            }))
          })));
        }
      });
  }, [project.id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { error: pErr } = await supabase.from("projects").update({
        name: info.name,
        address: info.address,
        gc: info.gc,
        gc_contact: info.gc_contact,
        gc_email: info.gc_email,
        contract_num: info.contract_num,
        contract_value: Number(info.contract_value) || 0,
        start_date: info.start_date,
        end_date: info.end_date,
        retainage: Number(info.retainage) || 10,
      }).eq("id", project.id);

      if (pErr) throw pErr;

      for (const b of buildings) {
        if (b.deleted && !b.isNew) {
          await supabase.from("buildings").delete().eq("id", b.id);
        } else if (b.isNew && !b.deleted) {
          const { data: nb } = await supabase
            .from("buildings")
            .insert([{ project_id: project.id, name: b.name }])
            .select()
            .single();

          if (nb) {
            const newUnits = units.filter(u => u.buildingId === b.id && !u.deleted);
            for (const u of newUnits) {
              await supabase.from("units").insert([{
                project_id: project.id,
                building_id: nb.id,
                name: u.name,
                unit_type: u.unit_type
              }]);
            }
          }
        } else if (!b.deleted) {
          await supabase.from("buildings").update({ name: b.name }).eq("id", b.id);
        }
      }

      for (const u of units.filter(u => !u.isNew)) {
        const building = buildings.find(b => b.id === u.buildingId);

        if (u.deleted || (building && building.deleted)) {
          await supabase.from("units").delete().eq("id", u.id);
        } else {
          await supabase.from("units").update({
            name: u.name,
            unit_type: u.unit_type
          }).eq("id", u.id);
        }
      }

      for (const u of units.filter(u => u.isNew)) {
        const building = buildings.find(b => b.id === u.buildingId);

        if (building && !building.isNew && !building.deleted && !u.deleted) {
          await supabase.from("units").insert([{
            project_id: project.id,
            building_id: u.buildingId,
            name: u.name,
            unit_type: u.unit_type
          }]);
        }
      }

      for (const g of groups) {
        if (g.deleted && !g.isNew) {
          await supabase.from("line_item_groups").delete().eq("id", g.id);
        } else if (g.isNew && !g.deleted) {
          const { data: ng } = await supabase
            .from("line_item_groups")
            .insert([{ project_id: project.id, name: g.name, cost_code: g.cost_code }])
            .select()
            .single();

          if (ng) {
            for (const item of g.items.filter(i => !i.deleted)) {
              await supabase.from("line_items").insert([{
                group_id: ng.id,
                label: item.label,
                unit_price: Number(item.unit_price) || 0
              }]);
            }
          }
        } else if (!g.deleted) {
          await supabase.from("line_item_groups").update({
            name: g.name,
            cost_code: g.cost_code
          }).eq("id", g.id);

          for (const item of g.items) {
            if (item.deleted && !item.isNew) {
              await supabase.from("line_items").delete().eq("id", item.id);
            } else if (item.isNew && !item.deleted) {
              await supabase.from("line_items").insert([{
                group_id: g.id,
                label: item.label,
                unit_price: Number(item.unit_price) || 0
              }]);
            } else if (!item.deleted) {
              await supabase.from("line_items").update({
                label: item.label,
                unit_price: Number(item.unit_price) || 0
              }).eq("id", item.id);
            }
          }
        }
      }

      onSaved();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = ["info", "buildings", "lineitems"];
  const tabLabels = {
    info: "Project Info",
    buildings: "Buildings & Units",
    lineitems: "Line Items"
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000CC", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "20px 16px 48px" }}>
      <div style={{ background: "#0A0F1E", border: "1px solid #1E2D3D", borderRadius: 16, width: "100%", maxWidth: 600, marginTop: 20 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #1E2D3D" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9" }}>
  EDIT MODAL TEST — FILE IS ACTIVE
</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 20, cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #1E2D3D", overflowX: "auto" }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #F59E0B" : "2px solid transparent", color: tab === t ? "#F59E0B" : "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "12px 16px", whiteSpace: "nowrap" }}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {tab === "info" && (
            <div>
              <Input label="Project Name" value={info.name} onChange={v => setInfo(i => ({ ...i, name: v }))} />
              <Input label="Address" value={info.address} onChange={v => setInfo(i => ({ ...i, address: v }))} />
              <Input label="GC Name" value={info.gc} onChange={v => setInfo(i => ({ ...i, gc: v }))} />
              <Input label="GC Contact" value={info.gc_contact} onChange={v => setInfo(i => ({ ...i, gc_contact: v }))} />
              <Input label="GC Email" value={info.gc_email} onChange={v => setInfo(i => ({ ...i, gc_email: v }))} />
              <Input label="Contract Number" value={info.contract_num} onChange={v => setInfo(i => ({ ...i, contract_num: v }))} />
              <Input label="Contract Value ($)" value={info.contract_value} onChange={v => setInfo(i => ({ ...i, contract_value: v }))} type="number" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Start Date" value={info.start_date} onChange={v => setInfo(i => ({ ...i, start_date: v }))} />
                <Input label="End Date" value={info.end_date} onChange={v => setInfo(i => ({ ...i, end_date: v }))} />
              </div>

              <Input label="Retainage %" value={info.retainage} onChange={v => setInfo(i => ({ ...i, retainage: v }))} type="number" />
            </div>
          )}

          {tab === "buildings" && (
            <BuildingsTab
              buildings={buildings}
              setBuildings={setBuildings}
              units={units}
              setUnits={setUnits}
            />
          )}

          {tab === "lineitems" && (
            <LineItemsTab
              groups={groups}
              setGroups={setGroups}
            />
          )}

          {error && (
            <div style={{ background: "#2D1B1B", border: "1px solid #EF4444", borderRadius: 8, padding: 12, color: "#EF4444", fontSize: 13, marginTop: 16 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid #1E2D3D" }}>
          <Btn onClick={onClose} color="#1F2937" textColor="#94A3B8">
            Cancel
          </Btn>

          <Btn onClick={handleSave} color="#10B981" textColor="#fff" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "✓ Save Changes"}
          </Btn>
        </div>
      </div>
    </div>
  );
}