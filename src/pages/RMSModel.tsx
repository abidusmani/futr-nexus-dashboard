"use client";

import React, { useMemo, useState, useEffect } from "react";
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

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Reset page when filters or source change
  useEffect(() => {
    setPage(1);
  }, [equipment, query, externalRows]);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  // Ensure current page is within range
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  // Map a generic API item to the table row shape we use
  const normalizeTypeValue = (v?: string) => {
    if (!v) return '';
    const s = String(v).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (s.includes('inverter')) return 'Inverter';
    if (s.includes('meter')) return 'Meter';
    if (s.includes('weathersensor') || s.includes('weather') || s.includes('sensor')) return 'WeatherSensor';
    // fallback: capitalize first letter
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  function mapApiItemToRow(item: any) {
    const rawName = item.name ?? item.standardName ?? item.attributeName ?? item.label ?? item.title ?? item.displayName ?? item.paramName ?? item.attribute ?? '';
    const rawType = item.type ?? item.deviceType ?? item.device_type ?? item.equipmentType ?? item.equipment ?? item.device ?? '';
    const type = normalizeTypeValue(rawType) || 'Inverter';

    return {
      name: rawName,
      type,
      unit: item.unit ?? item.uom ?? '--',
      color: item.color ?? item.colour ?? '',
      key: item.key ?? item.id ?? item._id ?? item.code ?? item.futrOSKey ?? '',
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
      console.debug('loadFromApi raw response:', data);
      // Expecting an array somewhere in the response
      let items: any[] = [];
      if (Array.isArray(data)) items = data;
      else if (Array.isArray(data.data)) items = data.data;
      else if (Array.isArray(data.items)) items = data.items;
      else if (Array.isArray(data.roles)) items = data.roles; // fallback
      else throw new Error('API returned unexpected shape — expected an array in the response');

      const mapped = items.map(mapApiItemToRow);
      console.debug('loadFromApi mapped rows:', mapped.slice(0,10));
      setExternalRows(mapped);
    } catch (e: any) {
      console.error('Failed to load API data', e);
      setApiError(e.message || String(e));
      setExternalRows(null);
    } finally {
      setIsLoadingApi(false);
    }
  }

  async function fetchStandardAttributes() {
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('token');
      const url = withApi(`/standardAttributes/registerStandard?deviceType=${encodeURIComponent(equipment)}`);
      const res = await fetch(url, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`API request failed: ${res.status}`);
      const data = await res.json();
      console.debug('fetchStandardAttributes raw response:', data);
      let items: any[] = [];
      if (Array.isArray(data)) items = data;
      else if (Array.isArray(data.data)) items = data.data;
      else if (Array.isArray(data.items)) items = data.items;
      else if (Array.isArray(data.attributes)) items = data.attributes;
      else throw new Error('API returned unexpected shape — expected an array in the response');

      const mapped = items.map(mapApiItemToRow);
      console.debug('fetchStandardAttributes mapped rows:', mapped.slice(0,10));
      setExternalRows(mapped);
    } catch (e: any) {
      console.error('Failed to load standard attributes', e);
      setApiError(e.message || String(e));
      setExternalRows(null);
    } finally {
      setIsLoadingApi(false);
    }
  }

  // Auto-load standard attributes whenever selected equipment changes
  useEffect(() => {
    // fetch attributes for the selected equipment on mount and whenever it changes
    fetchStandardAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment]);

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
            {/* Standard attributes are loaded automatically when device type changes. */}
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
            {paginatedRows.map((r) => (
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
      {/* Pagination controls shown when totalRows exceeds pageSize */}
      {totalRows > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalRows)} of {totalRows}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <div className="px-3 py-1 border rounded">Page {page} / {totalPages}</div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
