"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AIConfigSectionProps {
  hasGeminiKey: boolean;
  maskedGeminiKey: string | null;
  onKeyChanged: (hasKey: boolean, masked: string | null) => void;
}

export function AIConfigSection({
  hasGeminiKey,
  maskedGeminiKey,
  onKeyChanged,
}: AIConfigSectionProps) {
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const showInput = !hasGeminiKey || editing;

  async function handleSave() {
    if (!apiKey.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save API key");
      }

      const data = await res.json();
      onKeyChanged(data.hasGeminiKey, data.maskedGeminiKey);
      setApiKey("");
      setEditing(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save API key";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/api-key", { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to remove API key");
      }

      onKeyChanged(false, null);
      setEditing(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove API key";
      setError(message);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card className="p-8">
      <h2 className="font-headline font-bold text-xl tracking-tight mb-2">AI Configuration</h2>
      <p className="text-sm text-muted-foreground font-medium mb-6 leading-relaxed">
        Add your own Gemini API key for AI-powered recipe suggestions and meal
        plan generation. Your key is encrypted at rest.
      </p>

      {error && (
        <p role="alert" className="text-sm text-destructive mb-4 font-medium">{error}</p>
      )}

      {showInput ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="gemini-api-key" className="text-xs font-headline font-bold tracking-widest uppercase text-muted-foreground">
              Gemini API Key
            </Label>
            <Input
              id="gemini-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Get a key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || saving}
              className="signature-gradient text-white font-headline font-bold rounded-full px-6 py-5 hover:opacity-90"
            >
              {saving ? "Saving..." : "Save Key"}
            </Button>
            {editing && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setApiKey("");
                  setError(null);
                }}
                className="rounded-full font-headline font-bold"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-headline font-bold tracking-widest uppercase text-muted-foreground">
              Current API Key
            </Label>
            <p className="mt-2 font-mono text-sm text-card-foreground bg-muted rounded-xl px-4 py-2.5 inline-block">
              {maskedGeminiKey}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)} className="rounded-full font-headline font-bold">
              Update Key
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={removing} className="rounded-full font-headline font-bold">
                  {removing ? "Removing..." : "Remove Key"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline font-bold">Remove API key?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete your stored Gemini API key. AI features will
                    be unavailable until you add a new key.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full font-headline font-bold">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full font-headline font-bold"
                    onClick={handleRemove}
                  >
                    Remove Key
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </Card>
  );
}
