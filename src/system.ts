import { DefaultOptimizer, NostrEvent, NostrSystem, Optimizer, PowMiner } from "@snort/system";
import { default as wasmInit, schnorr_verify_event, pow } from "@snort/system-wasm";
import { WorkerRelayInterface } from "@snort/worker-relay";
import WorkerVite from "@snort/worker-relay/src/worker?worker";

import WasmPath from "@snort/system-wasm/pkg/system_wasm_bg.wasm?url";

const hasWasm = "WebAssembly" in globalThis;

const workerScript = import.meta.env.DEV
  ? new URL("@snort/worker-relay/dist/esm/worker.mjs", import.meta.url)
  : new WorkerVite();
const workerRelay = new WorkerRelayInterface(workerScript);

export const WasmOptimizer = {
  ...DefaultOptimizer,
  schnorrVerify: (ev) => {
    return schnorr_verify_event(ev);
  },
} as Optimizer;

export class WasmPowWorker implements PowMiner {
  minePow(ev: NostrEvent, target: number): Promise<NostrEvent> {
    const res = pow(ev, target);
    return Promise.resolve(res);
  }
}

export const System = new NostrSystem({
  cachingRelay: hasWasm ? workerRelay : undefined,
  optimizer: hasWasm ? WasmOptimizer : DefaultOptimizer,
  buildFollowGraph: true,
});

let didInit = false;
export async function initSystem() {
  if (didInit) return;
  didInit = true;

  if (hasWasm) {
    await wasmInit(WasmPath);
    await workerRelay.init({
      databasePath: "dtan.db",
      insertBatchSize: 100,
    });
    await workerRelay.configureSearchIndex({
      2003: ["title", "file"], // index torrent titles and filenames (content is always indexed)
    });
  }

  await System.Init();
}
