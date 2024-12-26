# DTAN

**D**istributed **T**orrent **A**rchive on **N**ostr

This is a [NIP-35](https://github.com/nostr-protocol/nips/blob/master/35.md) client.

NIP-35 defines the event format as:

```json
{
  "kind": 2003,
  "content": "<long-description-pre-formatted>",
  "tags": [
    ["title", "<torrent-title>"],
    ["x", "<bittorrent-info-hash>"],
    ["file", "<file-name>", "<file-size-in-bytes>"],
    ["file", "<file-name>", "<file-size-in-bytes>"],
    ["tracker", "udp://mytacker.com:1337"],
    ["tracker", "http://1337-tracker.net/announce"],
    ["i", "tcat:video,movie,4k"],
    ["i", "newznab:2045"],
    ["i", "imdb:tt15239678"],
    ["i", "tmdb:movie:693134"],
    ["i", "ttvdb:movie:290272"],
    ["t", "movie"],
    ["t", "4k"]
  ]
}
```

## Future Plans

### Custom scraper relay

A relay which automatically clones torrent events from other relays. 
Simple docker image which can easily be deployed anywhere and will add another replica of torrent metadata.
