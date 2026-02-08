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
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">AI Configuration</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Add your own Gemini API key for AI-powered recipe suggestions and meal
        plan generation. Your key is encrypted at rest.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {showInput ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="gemini-api-key">Gemini API Key</Label>
            <Input
              id="gemini-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get a key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || saving}
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
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label>Current API Key</Label>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {maskedGeminiKey}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              Update Key
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={removing}>
                  {removing ? "Removing..." : "Remove Key"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove API key?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete your stored Gemini API key. AI features will
                    be unavailable until you add a new key.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
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
