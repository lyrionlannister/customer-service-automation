import { useContext } from "react";
import BranchContext from "../contexts/branch-context";

const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};

export default useBranch;
