"use client"

import { Suspense } from 'react';
import { DataEditor } from "@/components/data-editor";
import { useSearchParams } from 'next/navigation';

function DataEditorPageInner() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') ?? 'prompts';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{name}</h1>
      <DataEditor name={name} />
    </div>
  );
}

export default function DataEditorPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DataEditorPageInner />
    </Suspense>
  );
}

