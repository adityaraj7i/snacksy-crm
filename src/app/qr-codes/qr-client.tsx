"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Copy, CheckCircle2, Printer, Sparkles, Plus, Minus } from "lucide-react";

interface QRCodesClientProps {
  qrData: {
    counterQRUrl: string;
    tableQRCodes: Array<{ id: string; tableNumber: string; name: string; section: string; qrUrl: string }>;
    totalTables: number;
  };
}

export function QRCodesClient({ qrData }: QRCodesClientProps) {
  const [copiedCounter, setCopiedCounter] = useState(false);
  const [activeTab, setActiveTab] = useState<"TENTS" | "CARDS">("TENTS");

  function handleCopyCounter() {
    navigator.clipboard.writeText(qrData.counterQRUrl);
    setCopiedCounter(true);
    setTimeout(() => setCopiedCounter(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8">
      {/* SECTION 1: COUNTER QR CODE */}
      <Card className="shadow-sm border-muted">
        <CardContent className="p-6 md:p-8 grid gap-6 md:grid-cols-12 items-center">
          {/* QR Code Canvas Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-muted shadow-inner text-center space-y-2">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {/* SVG QR Code Pattern Mockup */}
              <svg className="h-32 w-32 text-emerald-900 dark:text-emerald-300" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 H40 V40 H0 Z M10,10 V30 H30 V10 Z M60,0 H100 V40 H60 Z M70,10 V30 H90 V10 Z M0,60 H40 V100 H0 Z M10,70 V90 H30 V70 Z M60,60 H80 V80 H60 Z M80,80 H100 V100 H80 Z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">ORDER HERE</span>
          </div>

          {/* Details & Actions */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                COUNTER
              </span>
              <h2 className="text-2xl font-serif font-extrabold text-foreground">One QR for your whole menu</h2>
              <p className="text-xs text-muted-foreground">
                Place it at the entrance, bar, or counter. Guests choose their order type, then browse and order.
              </p>
            </div>

            {/* URL Input Box */}
            <div className="flex items-center gap-2 max-w-md">
              <Input
                readOnly
                value={qrData.counterQRUrl}
                className="font-mono text-xs bg-muted/50 border-muted"
              />
              <Button size="sm" variant="outline" onClick={handleCopyCounter} className="text-xs gap-1 font-semibold">
                <Copy className="h-3.5 w-3.5" /> {copiedCounter ? "Copied!" : "Copy"}
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              <strong className="text-foreground">0 scans</strong> · <strong className="text-foreground">0 orders</strong> · last scan —
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="sm" onClick={handlePrint} className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> View table tents
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint} className="text-xs gap-1.5 font-semibold">
                <Printer className="h-3.5 w-3.5" /> View cut-out cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: DINE-IN TABLE QR CODES */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              DINE-IN
            </span>
            <h2 className="text-xl font-serif font-extrabold text-foreground">Table QR codes</h2>
            <p className="text-xs text-muted-foreground">
              Each table gets its own code. Orders arrive tagged with the table number — no extra steps for your team.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-full border">
            <Button size="sm" variant="outline" className="h-7 w-7 rounded-full p-0">
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-xs font-bold px-2">{qrData.totalTables} tables</span>
            <Button size="sm" variant="outline" className="h-7 w-7 rounded-full p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{qrData.totalTables} of 30 QR codes active</span>
            <span>Growth Plan</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div style={{ width: `${Math.min(100, (qrData.totalTables / 30) * 100)}%` }} className="h-full bg-emerald-600 rounded-full" />
          </div>
        </div>

        {/* Table QR Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 pt-2">
          {qrData.tableQRCodes.map((table) => (
            <Card key={table.id} className="hover:border-emerald-600 transition-colors shadow-sm relative group">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <svg className="h-20 w-20 text-emerald-900 dark:text-emerald-300" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,0 H40 V40 H0 Z M10,10 V30 H30 V10 Z M60,0 H100 V40 H60 Z M70,10 V30 H90 V10 Z M0,60 H40 V100 H0 Z M10,70 V90 H30 V70 Z M60,60 H80 V80 H60 Z M80,80 H100 V100 H80 Z" />
                  </svg>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">TABLE</span>
                  <h3 className="text-lg font-extrabold text-foreground font-serif">{table.tableNumber}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
