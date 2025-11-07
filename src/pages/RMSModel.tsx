"use client";

import React, { useMemo, useState } from "react";
import { withApi } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sampleRows = [
  { name: "PCS inverter status", type: "Inverter", unit: "kw", color: "#441d1d", key: "i15", chart: "", files: 6 },
  { name: "reconnected time", type: "Inverter", unit: "--", color: "", key: "i16", chart: "", files: 1 },
  { name: "Total DC Power", type: "Inverter", unit: "W", color: "#f7464a", key: "i18", chart: "Spline", files: 32 },
  { name: "AC voltage_1", type: "Inverter", unit: "V", color: "", key: "i19", chart: "", files: 8 },
  { name: "AC current_1", type: "Inverter", unit: "A", color: "", key: "i20", chart: "", files: 6 },
  { name: "AC power_1", type: "Inverter", unit: "W", color: "", key: "i21", chart: "", files: 3 },
  { name: "AC frequency_1", type: "Inverter", unit: "Hz", color: "", key: "i22", chart: "", files: 2 },
  { name: "AC voltage_2", type: "Inverter", unit: "V", color: "", key: "i23", chart: "", files: 7 },
];

export default function RMSModelPage() {
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState("Inverter");
  const [apiUrl, setApiUrl] = useState('');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [externalRows, setExternalRows] = useState<any[] | null>(null);

  const rows = useMemo(() => {
    const source = externalRows ?? sampleRows;
    return source.filter((r: any) => {
      const q = query.trim().toLowerCase();
      if (!q) return r.type === equipment;
      return (
        r.type === equipment && ((r.name || '').toLowerCase().includes(q) || (r.key || '').toLowerCase().includes(q))
      );
    });
  }, [query, equipment, externalRows]);

  // Map a generic API item to the table row shape we use
  function mapApiItemToRow(item: any) {
    return {
      name: item.name ?? item.label ?? item.title ?? '',
      type: item.type ?? item.equipmentType ?? item.equipment ?? 'Inverter',
      unit: item.unit ?? item.uom ?? '--',
      color: item.color ?? item.colour ?? '',
      key: item.key ?? item.id ?? item._id ?? '',
      chart: item.chartType ?? item.chart ?? '',
      files: item.datafileCount ?? item.files ?? item.count ?? 0,
    };
  }

  async function loadFromApi() {
    if (!apiUrl) { setApiError('Provide an API URL'); return; }
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('token');
      const urlToUse = apiUrl.startsWith('/') ? withApi(apiUrl) : apiUrl;
      const res = await fetch(urlToUse, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`API request failed: ${res.status}`);
      const data = await res.json();
      // Expecting an array somewhere in the response
      let items: any[] = [];
      if (Array.isArray(data)) items = data;
      else if (Array.isArray(data.data)) items = data.data;
      else if (Array.isArray(data.items)) items = data.items;
      else if (Array.isArray(data.roles)) items = data.roles; // fallback
      else throw new Error('API returned unexpected shape — expected an array in the response');

      setExternalRows(items.map(mapApiItemToRow));
    } catch (e: any) {
      console.error('Failed to load API data', e);
      setApiError(e.message || String(e));
      setExternalRows(null);
    } finally {
      setIsLoadingApi(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-3">⟳</Button>
          <Button className="bg-blue-50 text-blue-700">Upload Strings Mapping</Button>
          <Button className="bg-blue-50 text-blue-700">Find New Data Params</Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="border rounded p-2" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
            <option>Inverter</option>
            <option>Meter</option>
            <option>WeatherSensor</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Input placeholder="API URL (absolute or /path)" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
        <Button onClick={loadFromApi} disabled={isLoadingApi}>{isLoadingApi ? 'Loading...' : 'Load from API'}</Button>
        {apiError && <div className="text-destructive ml-2">{apiError}</div>}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Equipment type</TableHead>
              <TableHead>Unit</TableHead>
              {/* <TableHead>Color</TableHead> */}
              <TableHead>Key</TableHead>
              {/* <TableHead>Chart Type</TableHead> */}
              {/* <TableHead>Datafile names</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.key} className="hover:bg-gray-50">
                <TableCell className="py-6">{r.name}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.unit}</TableCell>
                {/* <TableCell>
                  {r.color ? (
                    <span className="inline-block w-4 h-4 rounded" style={{ background: r.color }} />
                  ) : (
                    "--"
                  )}
                </TableCell> */}
                <TableCell>{r.key}</TableCell>
                {/* <TableCell>{r.chart || "--"}</TableCell> */}
                {/* <TableCell>{r.files}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
