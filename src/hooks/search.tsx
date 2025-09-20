import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

export default function useSearch() {
  const params = useParams();
  const location = useLocation();
  const term = params.term as string | undefined;
  const q = new URLSearchParams(location.search ?? "");
  const tags = q.get("tags")?.split(",") ?? [];
  const labels = q.getAll("i");

  return useMemo(
    () => ({
      term,
      tags,
      labels,
    }),
    [term, location.search],
  );
}
