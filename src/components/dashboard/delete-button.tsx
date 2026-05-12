"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteScan, deleteDomain } from "@/app/[locale]/dashboard/actions";
import { useRouter } from "next/navigation";

export function DeleteButton({ id, type, compact = false }: { id: string, type: "scan" | "domain", compact?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      if (type === "scan") {
        await deleteScan(id);
      } else {
        await deleteDomain(id);
      }
      router.refresh();
    } catch (e) {
      alert("Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 bg-red-500/10 transition-colors rounded-lg ${compact ? 'p-1.5' : 'px-3 py-1.5 text-xs font-bold gap-1'}`}
      title={`Delete ${type}`}
    >
      <Trash2 className={compact ? "w-4 h-4" : "w-3.5 h-3.5"} />
      {!compact && (isDeleting ? "..." : "Delete")}
    </button>
  );
}
