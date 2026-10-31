import {Tlt, useLanguage} from "@clairejs/react";
import {Link} from "@clairejs/react-web";

import {ImageWithFallback} from "../../components/image-with-fallback";
import type {ProductInfo} from "../../hooks/use-explorer-names";
import type {CountRecord, EntityRecord, RankingWindow} from "../../lib/indexer";
import {getEntityPath} from "../../utils/routing";
import {formatNumber, shortHash, shortUuid} from "../../utils/explorer-format";

interface Props {
  window: RankingWindow;
  onWindowChange: (window: RankingWindow) => void;
  rankings: {producers: CountRecord[]; products: CountRecord[]} | null | undefined;
  producers: Record<string, EntityRecord>;
  products: Record<string, ProductInfo>;
  onPickProducer: (address: string) => void;
  onPickProduct: (productUuid: string) => void;
}

function WindowSwitch({window, onChange}: {window: RankingWindow; onChange: (window: RankingWindow) => void}) {
  return (
    <div className="ex-seg" role="group">
      <button type="button" className={window === "30d" ? "on" : undefined} onClick={() => onChange("30d")}>
        <Tlt template="30 days" />
      </button>
      <button type="button" className={window === "all" ? "on" : undefined} onClick={() => onChange("all")}>
        <Tlt template="All time" />
      </button>
    </div>
  );
}

export function Rankings({window, onWindowChange, rankings, producers, products, onPickProducer, onPickProduct}: Props) {
  const [lang] = useLanguage();
  const topProducer = rankings?.producers[0]?.productionCount || 1;
  const empty = (
    <p className="faint small ex-empty">
      <Tlt template="No productions in this period." />
    </p>
  );

  return (
    <aside className="ex-side">
      <section className="ex-panel">
        <header className="ex-panel-h">
          <h2 className="h-4">
            <Tlt template="Top producers" />
          </h2>
          <WindowSwitch window={window} onChange={onWindowChange} />
        </header>
        {rankings && !rankings.producers.length ? (
          empty
        ) : (
          <ol className="ex-rank">
            {(rankings?.producers ?? []).map((row, index) => (
              <li key={row.key}>
                <span className="ex-rk mono">{index + 1}</span>
                <div className="ex-rank-body">
                  <div className="ex-rank-line">
                    <button type="button" className="ex-linkish" onClick={() => onPickProducer(row.key)}>
                      {producers[row.key]?.name || shortHash(row.key)}
                    </button>
                    <span className="mono small">{formatNumber(row.productionCount, lang)}</span>
                  </div>
                  <div className="ex-bar">
                    <i style={{width: `${(row.productionCount / topProducer) * 100}%`}} />
                  </div>
                  <Link className="faint small mono" to={getEntityPath(row.key)}>
                    {shortHash(row.key)}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="ex-panel">
        <header className="ex-panel-h">
          <h2 className="h-4">
            <Tlt template="Most produced" />
          </h2>
        </header>
        {rankings && !rankings.products.length ? (
          empty
        ) : (
          <ol className="ex-rank">
            {(rankings?.products ?? []).map((row, index) => {
              const info = products[row.key];
              return (
                <li key={row.key}>
                  <span className="ex-rk mono">{index + 1}</span>
                  <ImageWithFallback uri={info?.photoUrl} width={32} style={{border: "1px solid var(--line)", flexShrink: 0}} />
                  <div className="ex-rank-body">
                    <button type="button" className="ex-linkish" onClick={() => onPickProduct(row.key)}>
                      {info?.name || <span className="mono">{shortUuid(row.key)}</span>}
                    </button>
                    <span className="faint small">
                      {row.productionCount === 1 ? (
                        <Tlt template="1 batch" />
                      ) : (
                        <Tlt template="{count} batches" data={{count: formatNumber(row.productionCount, lang)}} />
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </aside>
  );
}
