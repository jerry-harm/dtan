import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useSearch from "../hooks/search";

export function Search() {
  const navigate = useNavigate();
  const { term: qTerm, tags: qTags } = useSearch();
  const [term, setTerm] = useState("");
  const [tags, setTags] = useState<Array<string>>([]);

  useEffect(() => {
    setTerm(qTerm ?? "");
    setTags(qTags ?? []);
  }, [qTerm, qTags]);

  return (
    <input
      type="text"
      placeholder="Search..."
      value={term}
      onChange={(e) => setTerm(e.target.value)}
      onKeyDown={(e) => {
        if (e.key == "Enter") {
          navigate(`/search/${encodeURIComponent(term)}${tags.length > 0 ? `?tags=${tags.join(",")}` : ""}`);
        }
      }}
    />
  );
}
