import { unwrap } from "@snort/shared";
import { NostrLink, RequestBuilder, TaggedNostrEvent, parseNostrLink } from "@snort/system";
import { useRequestBuilder, useUserProfile } from "@snort/system-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FormatBytes, TorrentKind } from "../const";
import { ProfileImage } from "../element/profile-image";
import { useLogin } from "../login";
import { Button } from "../element/button";
import { Comments } from "../element/comments";
import { Text } from "../element/text";
import { NostrTorrent } from "../nostr-torrent";
import CopyIcon from "../element/icon/copy";
import MagnetIcon from "../element/icon/magnet";
import ZapIcon from "../element/icon/zap";
import { useState } from "react";
import { SendZaps } from "../element/zap";
import { TorrentTagElement } from "../element/torrent-tag";
import RelatedTorrents from "../element/related-torrents";

export function TorrentPage() {
  const location = useLocation();
  const { id } = useParams();
  const evState = location.state && "kind" in location.state ? (location.state as TaggedNostrEvent) : undefined;

  const rb = new RequestBuilder("torrent:event");
  if (!evState) {
    rb.withFilter()
      .kinds([TorrentKind])
      .link(parseNostrLink(unwrap(id)));
  }

  const evNew = useRequestBuilder(rb);

  const ev = evState ?? evNew?.at(0);
  if (!ev) return;
  return <TorrentDetail item={ev} />;
}

export function TorrentDetail({ item }: { item: TaggedNostrEvent }) {
  const login = useLogin();
  const navigate = useNavigate();
  const profile = useUserProfile(item.pubkey);
  const torrent = NostrTorrent.fromEvent(item);
  const [sendZap, setShowZap] = useState(false);
  const [showFileList, setShowFileList] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);

  async function deleteTorrent() {
    const ev = await login?.builder?.delete(item.id);
    if (ev) {
      await login?.system.BroadcastEvent(ev);
      navigate(-1);
    }
  }

  function detailSection() {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg flex flex-row">
        <div className="flex flex-col gap-2 flex-grow">
          <div>Size: {FormatBytes(torrent.totalSize)}</div>
          <div>Uploaded: {new Date(torrent.publishedAt * 1000).toLocaleString()}</div>
          <div className="flex items-center gap-2">
            Tags:{" "}
            <div className="flex gap-2 items-center">
              {torrent.tags.map((a) => (
                <TorrentTagElement tag={a} />
              ))}
            </div>
          </div>
          {torrent.trackers.length > 0 && <div>Trackers: {torrent.trackers.length}</div>}
        </div>
        <div className="flex flex-col gap-2">
          {(profile?.lud16 ?? false) && (
            <Button type="zap" className="flex gap-1 items-center" onClick={() => setShowZap((s) => !s)}>
              <ZapIcon />
              Zap
            </Button>
          )}
          <Link to={torrent.magnetLink}>
            <Button type="primary" className="flex gap-1 items-center">
              <MagnetIcon />
              Get this torrent
            </Button>
          </Link>
          {item.pubkey == login?.publicKey && (
            <Button type="danger" onClick={deleteTorrent}>
              Delete
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex gap-2 items-center">
        <ProfileImage pubkey={item.pubkey} withName={true} />
        <div className="text-2xl">{torrent.title}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {detailSection()}
        <div className="bg-neutral-900 p-4 rounded-lg">
          <h3 className="mb-2">File List ({torrent.files.length} files)</h3>
          <div className="flex flex-col gap-1">
            {torrent.files.slice(0, showFileList ? torrent.files.length : 5).map((file, idx) => (
              <div key={idx} className="pl-1 flex justify-between items-center hover:bg-neutral-700">
                <div className="flex gap-2 min-w-0 flex-1">
                  <span>📄</span>
                  <span className="truncate" title={file.name}>{file.name}</span>
                </div>
                <div className="flex-shrink-0 ml-2">{FormatBytes(file.size)}</div>
              </div>
            ))}
            {torrent.files.length > 5 && (
              <button
                className="mt-2 text-blue-400 hover:text-blue-300 text-left"
                onClick={() => setShowFileList(!showFileList)}
              >
                {showFileList ? 'Show less' : `Show ${torrent.files.length - 5} more files`}
              </button>
            )}
          </div>
        </div>
      </div>
      <RelatedTorrents torrent={torrent} />
      {item.content && (
        <>
          <h3 className="mt-2">Description</h3>
          <div className="bg-neutral-900 p-4 rounded-lg">
            <pre 
              className={`font-mono text-sm overflow-y-auto ${
                !expandDescription ? 'max-h-32 overflow-hidden' : ''
              }`}
            >
              <Text content={item.content} tags={item.tags} wrap={false}></Text>
            </pre>
            {item.content.length > 200 && (
              <button
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => setExpandDescription(!expandDescription)}
              >
                {expandDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </>
      )}
      {sendZap && (
        <div className="bg-neutral-900 rounded-xl p-4">
          <SendZaps
            lnurl={profile?.lud16 ?? ""}
            eTag={item.id}
            pubkey={item.pubkey}
            onFinish={() => setShowZap(false)}
          />
        </div>
      )}
      <h3>Comments</h3>
      <Comments ev={item} />
      <h3>Other Links</h3>
      <div className="flex items-center gap-4">
        <Button
          type="secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(JSON.stringify(item, undefined, 2));
          }}
          className="flex gap-1 items-center"
        >
          <CopyIcon />
          Copy JSON
        </Button>
      </div>
    </div>
  );
}
