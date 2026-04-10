import { useGameStore } from "../../store/gameStore";
import type { Product } from "../../types";

function QualityBadge({ product }: { product: Product }) {
  if (!product.inspected) {
    return <span className="text-shell-dim">???</span>;
  }
  const colors: Record<string, string> = {
    bad: "text-shell-danger",
    ok: "text-shell-dim",
    good: "text-shell-good",
    excellent: "text-shell-cyan",
  };
  return (
    <span className={colors[product.quality] ?? "text-shell-dim"}>
      {product.quality.toUpperCase()}
    </span>
  );
}

function InventoryRow({ product }: { product: Product }) {
  const listProduct = useGameStore((s) => s.listProduct);
  const inspectProduct = useGameStore((s) => s.inspectProduct);
  const isInspecting = product.inspectTicks !== null && product.inspectTicks > 0;
  const isGrey = product.tier >= 2;

  return (
    <div className={`shell-panel-inset p-2 mb-2 font-mono text-xs${isGrey ? " border-shell-warn/40" : ""}`}
      style={isGrey ? { borderColor: "rgba(255, 204, 0, 0.3)" } : undefined}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className={`truncate${isGrey ? " text-shell-warn" : " text-shell-text"}`}>
            {isGrey ? "⚠️" : "📦"} {product.name}
          </div>
          <div className="text-shell-dim">
            bought ${product.buyPrice} · risk {product.risk} · quality:{" "}
            <QualityBadge product={product} />
          </div>
          {product.inspected && product.hiddenTrait && (
            <div className="text-shell-warn italic mt-0.5 truncate">
              ~ {product.hiddenTrait}
            </div>
          )}
          {isInspecting && (
            <div className="text-shell-cyan mt-0.5">
              🔍 inspecting... {product.inspectTicks}t remaining
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col gap-1">
          {!product.inspected && !isInspecting && (
            <>
              <button
                onClick={() => inspectProduct(product.id, "quick")}
                className="shell-button !text-shell-cyan text-[10px]"
              >
                🔎 QUICK $5
              </button>
              <button
                onClick={() => inspectProduct(product.id, "deep")}
                className="shell-button !text-shell-cyan text-[10px]"
              >
                🔍 DEEP $20
              </button>
            </>
          )}
          {!isInspecting && (
            <button
              onClick={() => listProduct(product.id)}
              className="shell-button !text-shell-good"
              data-testid={`list-product-${product.id}`}
            >
              {product.inspected ? "▶ LIST" : "▶ SELL BLIND"} ${product.sellPrice}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ListingRow({ product }: { product: Product }) {
  const isGrey = product.tier >= 2;
  return (
    <div className={`shell-panel-inset p-2 mb-2 font-mono text-xs${isGrey ? " border-shell-warn/40" : ""}`}
      style={isGrey ? { borderColor: "rgba(255, 204, 0, 0.3)" } : undefined}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <div className={`truncate${isGrey ? " text-shell-warn" : " text-shell-text"}`}>
            {isGrey ? "⚠️" : "🏷️"} {product.name}
          </div>
          <div className="text-shell-cyan">
            listed @ ${product.sellPrice} · <QualityBadge product={product} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-shell-good text-base leading-none">
            {product.ticksToSell ?? "—"}t
          </div>
          <div className="text-shell-dim">to sale</div>
        </div>
      </div>
    </div>
  );
}

export function Market() {
  const products = useGameStore((s) => s.products);
  const money = useGameStore((s) => s.money);

  const inventory = products.filter((p) => !p.listed);
  const listings = products.filter((p) => p.listed);

  return (
    <>
      <div className="flex-1 overflow-hidden flex">
        {/* Inventory */}
        <div className="flex-1 border-r-2 border-shell-border flex flex-col overflow-hidden">
          <div className="px-3 py-1 font-mono text-xs uppercase text-shell-cyan border-b border-shell-border bg-shell-panel2 flex justify-between">
            <span>📦 Inventory</span>
            <span data-testid="market-inventory-count">
              [{inventory.length}]
            </span>
          </div>
          <div className="flex-1 overflow-y-auto log-scroll p-2">
            {inventory.length === 0 ? (
              <div className="text-shell-dim font-mono text-xs p-2">
                // Nothing to list yet. Send an agent to source something.
              </div>
            ) : (
              inventory.map((p) => (
                <InventoryRow key={p.id} product={p} />
              ))
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1 font-mono text-xs uppercase text-shell-cyan border-b border-shell-border bg-shell-panel2 flex justify-between">
            <span>🏷️ Listings</span>
            <span data-testid="market-listings-count">
              [{listings.length}]
            </span>
          </div>
          <div className="flex-1 overflow-y-auto log-scroll p-2">
            {listings.length === 0 ? (
              <div className="text-shell-dim font-mono text-xs p-2">
                // No active listings. Money is not coming.
              </div>
            ) : (
              listings.map((p) => <ListingRow key={p.id} product={p} />)
            )}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-shell-border bg-shell-panel2 px-3 py-1 font-mono text-xs text-shell-dim flex justify-between">
        <span>
          💰 ${money} · {inventory.length} unlisted · {listings.length}{" "}
          listed
        </span>
        <span>MARKET.EXE v0.2</span>
      </div>
    </>
  );
}
