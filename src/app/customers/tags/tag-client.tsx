"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag as TagIcon, Plus, Check } from "lucide-react";

interface TagAdminClientProps {
  tags: Array<{
    id: string;
    name: string;
    description: string | null;
    colorHex: string;
    _count: { customerTags: number };
  }>;
}

export function TagAdminClient({ tags }: TagAdminClientProps) {
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#2563EB");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-primary" /> Active Customer Tags ({tags.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          {tags.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.colorHex }} />
                <span className="font-bold text-foreground">{t.name}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {t._count.customerTags} Customers
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
