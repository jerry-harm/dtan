import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useSearch from "../hooks/search";

export function Search() {
  const navigate = useNavigate();
  const { term: qTerm, tags: qTags, labels: qLabels } = useSearch();
  const [term, setTerm] = useState("");
  const [tags, setTags] = useState<Array<string>>([]);
  const [labels, setLabels] = useState<Array<string>>([]);

  useEffect(() => {
    setTerm(qTerm ?? "");
    setTags(qTags ?? []);
    setLabels(qLabels ?? []);
  }, [qTerm, qTags, qLabels]);

  const params = new URLSearchParams();
  if (tags.length > 0) {
    params.append("tags", tags.join(","));
  }
  if (labels.length > 0) {
    params.append("i", labels.join(","));
  }
  return (
    <input
      type="text"
      placeholder="Search..."
      value={term}
      onChange={(e) => setTerm(e.target.value)}
      onKeyDown={(e) => {
        if (e.key == "Enter") {
          navigate(`/search/${encodeURIComponent(term)}?${params.toString()}`);
        }
      }}
    />
  );
}
