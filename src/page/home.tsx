import { LatestTorrents } from "../element/latest";
import TrendingTorrents from "../element/trending";

export function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h3>Trending Movies</h3>
      <TrendingTorrents
        tag={{
          type: "generic",
          value: "movie",
        }}
      />
      <h3>Trending TV</h3>
      <TrendingTorrents
        tag={{
          type: "generic",
          value: "tv",
        }}
      />
      <LatestTorrents />
    </div>
  );
}
