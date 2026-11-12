import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "../../hooks/use-api-client";
import BranchContext, { type BranchRecord } from "../branch-context";

const STORAGE_KEY = "activeBranchId";

const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { apiClient } = useApiClient();
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [activeBranchId, setActiveBranchIdState] = useState<string>(
    () => sessionStorage.getItem(STORAGE_KEY) ?? "",
  );

  const setActiveBranchId = useCallback((id: string) => {
    setActiveBranchIdState(id);
    sessionStorage.setItem(STORAGE_KEY, id);
  }, []);

  const refreshBranches = useCallback(async () => {
    try {
      const res = await apiClient("/branches");
      if (!res.ok) return;
      const data = (await res.json()) as BranchRecord[];
      setBranches(data);

      setActiveBranchIdState((prev) => {
        if (prev && data.some((b) => b.id === prev)) return prev;
        const fallback = data.find((b) => b.isActive)?.id ?? data[0]?.id ?? "";
        if (fallback) sessionStorage.setItem(STORAGE_KEY, fallback);
        return fallback;
      });
    } catch {
      // noop: la app sigue usable, solo sin selector de sucursal poblado
    }
  }, [apiClient]);

  useEffect(() => {
    refreshBranches();
  }, [refreshBranches]);

  return (
    <BranchContext.Provider value={{ branches, activeBranchId, setActiveBranchId, refreshBranches }}>
      {children}
    </BranchContext.Provider>
  );
};

export default BranchProvider;
