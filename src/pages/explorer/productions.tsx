import {Tlt, useLanguage} from "@clairejs/react";
import {Link} from "@clairejs/react-web";
import {ArrowUpRight} from "lucide-react";

import {ImageWithFallback} from "../../components/image-with-fallback";
import type {ProductInfo} from "../../hooks/use-explorer-names";
import {EXPLORER_BLOCK_EXPLORER_URL, type EntityRecord, type ProductionRecord} from "../../lib/indexer";
import {getEntityPath, getTrackingPath} from "../../utils/routing";
import {formatAge, formatIsoDate, formatNumber, initials, shortHash, shortUuid} from "../../utils/explorer-format";

interface Props {
  view: "table" | "grid";
  records: ProductionRecord[];
  fresh: Set<string>;
  producers: Record<string, EntityRecord>;
  products: Record<string, ProductInfo>;
  now: number;
}

const SOON_SECONDS = 30 * 86400;

function Expiry({expiration, now}: {expiration: number; now: number}) {
  if (!expiration) {
    return <span className="faint">—</span>;
  }
  const left = expiration - now / 1000;
  if (left <= 0) {
    return (
      <span className="ex-tag danger">
        <Tlt template="Expired" />
      </span>
    );
  }
  if (left < SOON_SECONDS) {
    return (
      <span className="ex-tag warn">
        <Tlt template="in {days}d" data={{days: String(Math.ceil(left / 86400))}} />
      </span>
    );
  }
  return <span className="mono">{formatIsoDate(expiration)}</span>;
}

function Thumb({info, size}: {info?: ProductInfo; size: number}) {
  //-- A named product without a photo gets its initials; an unresolved one the image placeholder.
  if (info?.name && !info.photoUrl) {
    return (
      <span className="ex-thumb" style={{width: size, height: size}} aria-hidden="true">
        {initials(info.name)}
      </span>
    );
  }
  return <ImageWithFallback uri={info?.photoUrl} width={size} style={{border: "1px solid var(--line)", flexShrink: 0}} />;
}

function ProductName({uuid, info}: {uuid: string; info?: ProductInfo}) {
  return info?.name ? <>{info.name}</> : <span className="mono">{shortUuid(uuid)}</span>;
}

export function Productions({view, records, fresh, producers, products, now}: Props) {
  const [lang] = useLanguage();

  if (view === "grid") {
    return (
      <div className="ex-grid">
        {records.map((record) => {
          const info = products[record.productUuid];
          return (
            <Link
              key={record.id}
              to={getTrackingPath(record.productionUuid)}
              className={`ex-card${fresh.has(record.id) ? " fresh" : ""}`}
            >
              <div className="ex-card-img">
                <Thumb info={info} size={400} />
                <span className="ex-q mono">×{formatNumber(record.quantity, lang)}</span>
              </div>
              <div className="ex-card-b">
                <p className="ex-name">
                  <ProductName uuid={record.productUuid} info={info} />
                </p>
                <p className="muted small">{producers[record.entity]?.name || shortHash(record.entity)}</p>
                <p className="faint small ex-card-meta">
                  <span className="mono">{shortUuid(record.productionUuid)}</span>
                  <span>
                    <Tlt template="{age} ago" data={{age: formatAge(Number(record.blockTimestamp), now)}} />
                  </span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="ex-table" role="table">
      <div className="ex-tr ex-th" role="row">
        <span role="columnheader">
          <Tlt template="Batch" />
        </span>
        <span role="columnheader">
          <Tlt template="Product" />
        </span>
        <span role="columnheader" className="ex-c-producer">
          <Tlt template="Producer" />
        </span>
        <span role="columnheader" className="ex-r">
          <Tlt template="Quantity" />
        </span>
        <span role="columnheader" className="ex-c-inputs">
          <Tlt template="Inputs" />
        </span>
        <span role="columnheader" className="ex-c-exp">
          <Tlt template="Expires" />
        </span>
        <span role="columnheader">
          <Tlt template="Age" />
        </span>
        <span role="columnheader" className="ex-c-tx">
          <Tlt template="Transaction" />
        </span>
      </div>

      {records.map((record) => {
        const info = products[record.productUuid];
        const producer = producers[record.entity];
        const timestamp = Number(record.blockTimestamp);

        return (
          <div key={record.id} className={`ex-tr${fresh.has(record.id) ? " fresh" : ""}`} role="row">
            <span role="cell" className="ex-cell2">
              <span className="mono">{shortUuid(record.productionUuid)}</span>
            </span>
            <span role="cell" className="ex-prod">
              <Thumb info={info} size={36} />
              <span className="ex-cell2">
                {/* The row's main link: its ::after stretches over the whole row, so a click anywhere
                    that is not another link opens the lot page, and middle-click still works. */}
                <Link className="ex-row-link ex-name" to={getTrackingPath(record.productionUuid)}>
                  <ProductName uuid={record.productUuid} info={info} />
                </Link>
                <span className="faint small">
                  {record.inputCount ? <Tlt template="Processed" /> : <Tlt template="Raw" />}
                  {info?.unit ? ` · ${info.unit}` : ""}
                </span>
              </span>
            </span>
            <span role="cell" className="ex-cell2 ex-c-producer">
              <Link className="ex-above" to={getEntityPath(record.entity)}>
                {producer?.name || shortHash(record.entity)}
              </Link>
              <span className="faint small mono">{shortHash(record.entity)}</span>
            </span>
            <span role="cell" className="ex-r mono">
              {formatNumber(record.quantity, lang)}
            </span>
            <span role="cell" className="ex-c-inputs">
              {record.inputCount ? (
                <span className="ex-tag">
                  {record.inputCount === 1 ? (
                    <Tlt template="1 batch" />
                  ) : (
                    <Tlt template="{count} batches" data={{count: String(record.inputCount)}} />
                  )}
                </span>
              ) : (
                <span className="ex-tag dashed">
                  <Tlt template="none" />
                </span>
              )}
            </span>
            <span role="cell" className="ex-c-exp">
              <Expiry expiration={Number(record.expirationDate)} now={now} />
            </span>
            <span role="cell" className="small muted" title={new Date(timestamp * 1000).toISOString()}>
              <Tlt template="{age} ago" data={{age: formatAge(timestamp, now)}} />
            </span>
            <span role="cell" className="ex-c-tx">
              <a
                className="ex-above mono small"
                href={`${EXPLORER_BLOCK_EXPLORER_URL}/tx/${record.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {shortHash(record.txHash)}
                <ArrowUpRight size={12} />
              </a>
            </span>
          </div>
        );
      })}
    </div>
  );
}
