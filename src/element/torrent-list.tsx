import "./torrent-list.css";
import { NostrLink, NostrPrefix, TaggedNostrEvent } from "@snort/system";
import { FormatBytes } from "../const";
import { Link } from "react-router-dom";
import { Mention } from "./mention";
import { useMemo, useState } from "react";
import { NostrTorrent } from "../nostr-torrent";
import MagnetIcon from "./icon/magnet";
import IMDB from "../logo/IMDb_logo.svg";
import { Button } from "./button";
import useWoT from "../wot";

export function TorrentList({ items, showAll = false, currentInfoHash }: { items: Array<TaggedNostrEvent>; showAll?: boolean; currentInfoHash?: string }) {
  const [pageSize, setPageSize] = useState(showAll ? 100_000 : 50);
  const [pageNum, setPageNum] = useState(0);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [maxDistance] = useState(2);
  const wot = useWoT();

  const filteredTorrents = useMemo(() => {
    if (!filterEnabled) {
      return items;
    }
    // Filter by WoT distance
    return items.filter((torrent) => {
      const distance = wot.followDistance(torrent.pubkey);
      return distance <= maxDistance;
    });
  }, [items, filterEnabled, maxDistance, wot]);

  const totalPages = Math.ceil(filteredTorrents.length / pageSize);
  const startIndex = pageNum * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTorrents.length);

  return (
    <>
      {!showAll && (
        <div className="flex items-center gap-2 mb-4">
          <Button type={filterEnabled ? "primary" : "secondary"} small onClick={() => setFilterEnabled(!filterEnabled)}>
            {filterEnabled ? "WoT Filter: ON" : "WoT Filter: OFF"}
          </Button>
          {filterEnabled && (
            <span className="text-sm text-neutral-400">
              Filtering by Web of Trust (max distance: {maxDistance}, size: {wot.size()})
            </span>
          )}
        </div>
      )}
      <table className="torrent-list">
        <thead>
          <tr className="h-8">
            <th className="rounded-tl-lg">Category</th>
            <th>Name</th>
            <th></th>
            <th>Uploaded</th>
            <th></th>
            <th>Size</th>
            <th className="rounded-tr-lg">From</th>
          </tr>
        </thead>
        <tbody>
          {filteredTorrents.slice(pageNum * pageSize, pageNum * pageSize + pageSize).map((a) => (
            <TorrentTableEntry item={a} key={a.id} currentInfoHash={currentInfoHash} />
          ))}
        </tbody>
      </table>
      {!showAll && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-neutral-400">
            Showing {startIndex + 1}-{endIndex} of {filteredTorrents.length} torrents
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNum(Math.max(0, pageNum - 1))}
              disabled={pageNum === 0}
              className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-400">
              Page {pageNum + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPageNum(Math.min(totalPages - 1, pageNum + 1))}
              disabled={pageNum >= totalPages - 1}
              className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-400">Items per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNum(0);
              }}
              className="bg-neutral-800 text-white border border-neutral-600 rounded px-2 py-1 text-sm"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}

function TagList({ torrent }: { torrent: NostrTorrent }) {
  return torrent.categoryPath
    .slice(0, 3)
    .map((current, index, allTags) => <TagListEntry key={current} tags={allTags} startIndex={index} tag={current} />);
}

function TagListEntry({ tags, startIndex, tag }: { tags: string[]; startIndex: number; tag: string }) {
  const tagUrl = useMemo(() => {
    return encodeURIComponent(tags.slice(0, startIndex + 1).join(","));
  }, [tags, startIndex]);

  return (
    <>
      <Link to={`/search/?tags=${tagUrl}`}>{tag}</Link>
      {tags.length !== startIndex + 1 && " > "}
    </>
  );
}

function TorrentTableEntry({ item, currentInfoHash }: { item: TaggedNostrEvent; currentInfoHash?: string }) {
  const torrent = NostrTorrent.fromEvent(item);
  const isDuplicate = currentInfoHash && torrent.infoHash === currentInfoHash;

  return (
    <tr className="hover:bg-indigo-800">
      <td className="text-indigo-300">
        <TagList torrent={torrent} />
      </td>
      <td className="break-words">
        <div className="flex items-center gap-2">
          {isDuplicate && (
            <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded font-bold uppercase">
              duplicate:{item.id.slice(-8)}
            </span>
          )}
          <Link to={`/e/${NostrLink.fromEvent(item).encode()}`} state={item}>
            {torrent.title?.trim() || "Untitled"}
          </Link>
        </div>
      </td>
      <td>
        {torrent.imdb && (
          <Link to={`/search?i=imdb:${torrent.imdb}`} title="IMDB title search">
            <img src={IMDB} className="h-3" />
          </Link>
        )}
      </td>
      <td className="text-neutral-300">{new Date(torrent.publishedAt * 1000).toLocaleDateString()}</td>
      <td>
        <Link to={torrent.magnetLink}>
          <MagnetIcon />
        </Link>
      </td>
      <td className="whitespace-nowrap text-right text-neutral-300">{FormatBytes(torrent.totalSize)}</td>
      <td className="text-indigo-300 whitespace-nowrap break-words text-ellipsis">
        <div className="flex items-center gap-2">
          <Mention link={new NostrLink(NostrPrefix.PublicKey, item.pubkey)} />
        </div>
      </td>
    </tr>
  );
}
