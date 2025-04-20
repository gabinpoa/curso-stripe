"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MDXEditor({ value, onChange }: MDXEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("edit");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="edit" className="mt-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
          placeholder="# Write your MDX content here..."
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-0">
        <Card className="p-4 min-h-[200px] prose prose-sm max-w-none">
          {value ? (
            <div
              dangerouslySetInnerHTML={{
                __html: "<p>MDX preview would render here</p>",
              }}
            />
          ) : (
            <p className="text-muted-foreground italic">
              No content to preview
            </p>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
