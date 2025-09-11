import { type ReactNode, useEffect, useState } from "react";
import { LNURL } from "@snort/shared";
import { EventPublisher, NostrEvent, PrivateKeySigner } from "@snort/system";
import { useLogin } from "../login";
import { useRelays } from "../relays";
import { formatSats } from "../const";
import { Button } from "./button";
import QrCode from "./qr";
import classNames from "classnames";

export interface LNURLLike {
  get name(): string;
  get maxCommentLength(): number;
  get canZap(): boolean;
  getInvoice(amountInSats: number, comment?: string, zap?: NostrEvent): Promise<{ pr?: string }>;
}

export interface SendZapsProps {
  lnurl: string | LNURLLike;
  pubkey?: string;
  aTag?: string;
  eTag?: string;
  targetName?: string;
  onFinish: () => void;
  onTargetReady?: () => void;
  button?: ReactNode;
}

export function SendZaps({ lnurl, pubkey, aTag, eTag, targetName, onFinish, onTargetReady }: SendZapsProps) {
  const satsAmounts = [
    21, 69, 121, 420, 1_000, 2_100, 4_200, 10_000, 21_000, 42_000, 69_000, 100_000, 210_000, 500_000, 1_000_000,
  ];
  const [svc, setSvc] = useState<LNURLLike>();
  const [customAmount, setCustomAmount] = useState(false);
  const [amount, setAmount] = useState(satsAmounts[0]);
  const [comment, setComment] = useState("");
  const [invoice, setInvoice] = useState("");
  const login = useLogin();
  const relays = useRelays();
  const name = targetName ?? svc?.name;
  async function loadService(lnurl: string) {
    const s = new LNURL(lnurl);
    await s.load();
    setSvc(s);
  }

  useEffect(() => {
    if (!svc) {
      if (typeof lnurl === "string") {
        loadService(lnurl)
          .then(() => {
            onTargetReady?.();
          })
          .catch(console.warn);
      } else {
        setSvc(lnurl);
        onTargetReady?.();
      }
    }
  }, [lnurl]);

  async function send() {
    if (!svc) return;
    let pub = login?.builder;
    let isAnon = false;
    if (!pub) {
      const k = PrivateKeySigner.random();
      pub = new EventPublisher(k, k.getPubKey());
      isAnon = true;
    }

    let zap: NostrEvent | undefined;
    if (pubkey) {
      zap = await pub.zap(amount * 1000, pubkey, relays.relays, undefined, comment, (eb) => {
        if (aTag) {
          eb.tag(["a", aTag]);
        }
        if (eTag) {
          eb.tag(["e", eTag]);
        }
        if (isAnon) {
          eb.tag(["anon", ""]);
        }
        return eb;
      });
    }
    const invoice = await svc.getInvoice(amount, comment, zap);
    if (!invoice.pr) return;
    setInvoice(invoice.pr);
  }

  function input() {
    if (invoice) return;
    return (
      <>
        <div className="flex flex-col gap-2">
          <small>Zap amount in SATS</small>
          <div className="grid grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 text-center">
            {!customAmount &&
              satsAmounts.map((a) => (
                <div
                  key={a}
                  className={classNames("rounded-full", a === amount ? "bg-neutral-600" : "bg-neutral-800")}
                  onClick={() => setAmount(a)}
                >
                  {formatSats(a)}
                </div>
              ))}
            <div
              onClick={() => setCustomAmount((s) => !s)}
              className={classNames("rounded-full", customAmount ? "bg-neutral-600" : "bg-neutral-800")}
            >
              Custom
            </div>
          </div>
          {customAmount && <input type="number" value={amount} onChange={(e) => setAmount(e.target.valueAsNumber)} />}
        </div>
        {svc && (svc.maxCommentLength > 0 || svc.canZap) && (
          <div className="flex flex-col gap-2">
            <small>Your comment for {name}</small>
            <textarea
              className="w-full"
              placeholder="Nice!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        )}
        <Button type="primary" onClick={send}>
          Zap!
        </Button>
      </>
    );
  }

  function payInvoice() {
    if (!invoice) return;

    const link = `lightning:${invoice}`;
    return (
      <>
        <QrCode data={link} link={link} className="mx-auto" />
        <div className="monospace select-all break-all text-center text-sm">{invoice}</div>
        <Button type="secondary" onClick={() => onFinish()}>
          Back
        </Button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="flex gap-2 items-center">Zap {name}</h3>
      {input()}
      {payInvoice()}
    </div>
  );
}
