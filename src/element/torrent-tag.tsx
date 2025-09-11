import { Link } from "react-router-dom";
import { NostrTorrent, TorrentTag } from "../nostr-torrent";

import IMDB from "../logo/IMDb_logo.svg";
import { ReactNode } from "react";

export function TorrentTagElement({ tag }: { tag: TorrentTag }) {
  function wrap(elm: ReactNode) {
    return (
      <div key={tag.value} className="rounded-2xl py-1 px-4 bg-indigo-800 hover:bg-indigo-700">
        {elm}
      </div>
    );
  }

  function innerLink() {
    switch (tag.type) {
      case "tcat":
        return;
      case "imdb": {
        const url = NostrTorrent.externalDbLink(tag);
        return (
          <a href={url} target="_blank">
            <img src={IMDB} className="h-8" />
          </a>
        );
      }
      default:
        return wrap(<Link to={`/search/?tags=${tag.value}`}>#{tag.value}</Link>);
    }
  }

  return innerLink();
}
