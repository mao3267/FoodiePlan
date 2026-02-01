"use client";

import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette } from "lucide-react";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Appearance</h2>
      <div className="flex items-start gap-3">
        <Palette className="size-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="font-medium mb-3">Theme</p>
          <RadioGroup
            value={theme ?? "dark"}
            onValueChange={setTheme}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Light</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Dark</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">System</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  );
}
