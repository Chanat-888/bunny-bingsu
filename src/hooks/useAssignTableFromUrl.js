import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useAssignTableFromUrl() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableFromUrl = params.get("table");
    if (tableFromUrl) {
      localStorage.setItem("tableNumber", tableFromUrl);
    }
  }, [location]);
}
