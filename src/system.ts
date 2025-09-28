import { DefaultOptimizer, NostrEvent, NostrSystem, Optimizer, PowMiner } from "@snort/system";
import { WorkerRelayInterface } from "@snort/worker-relay";
import WorkerVite from "@snort/worker-relay/src/worker?worker";
import { verifyEvent, getEventHash } from "nostr-tools";

const workerScript = import.meta.env.DEV
  ? new URL("@snort/worker-relay/dist/esm/worker.mjs", import.meta.url)
  : new WorkerVite();
const workerRelay = new WorkerRelayInterface(workerScript);

export const JsOptimizer = {
  ...DefaultOptimizer,
  schnorrVerify: (ev: NostrEvent) => {
    return verifyEvent(ev);
  },
} as Optimizer;

export class JsPowWorker implements PowMiner {
  minePow(ev: NostrEvent, target: number): Promise<NostrEvent> {
    let nonce = 0;
    const event = { ...ev };
    
    while (true) {
      event.tags = event.tags.filter(t => t[0] !== "nonce");
      event.tags.push(["nonce", nonce.toString(), target.toString()]);
      event.id = getEventHash(event);
      
      if (this.checkPow(event.id, target)) {
        return Promise.resolve(event);
      }
      nonce++;
    }
  }

  private checkPow(hash: string, target: number): boolean {
    const requiredPrefix = "0".repeat(target);
    return hash.startsWith(requiredPrefix);
  }
}

export const System = new NostrSystem({
  cachingRelay: workerRelay,
  optimizer: JsOptimizer,
  buildFollowGraph: true,
});

let didInit = false;
export async function initSystem() {
  if (didInit) return;
  didInit = true;


    await workerRelay.init({
      databasePath: "dtan.db",
      insertBatchSize: 100,
    });
    await workerRelay.configureSearchIndex({
      2003: ["title", "file"], // index torrent titles and filenames (content is always indexed)
    });
  

  await System.Init();
}
