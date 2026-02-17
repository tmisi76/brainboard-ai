"use client";

import { AI_MODELS, type AIModelId } from "@/lib/ai/config";
import { Select, type SelectOption } from "@/components/ui/select";

interface ModelSelectorProps {
  value: AIModelId;
  onChange: (modelId: AIModelId) => void;
  disabled?: boolean;
}

const modelOptions: SelectOption[] = Object.entries(AI_MODELS).map(
  ([key, config]) => ({
    value: key,
    label: config.name,
  })
);

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as AIModelId)}
      options={modelOptions}
      disabled={disabled}
      className="w-48"
    />
  );
}
