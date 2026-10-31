import {getText, Tlt, useLanguage} from "@clairejs/react";
import {useNavigator} from "@clairejs/react-web";
import {LayoutGrid, Rows3, X} from "lucide-react";
import {useCallback, useEffect, useMemo, useRef, useState, type FormEvent} from "react";

import {Spinner} from "../../components/spinner";
import {useExplorerNames} from "../../hooks/use-explorer-names";
import {
  countProductionsAfter,
  findProductionsByUuid,
  getFilterOptions,
  getProductions,
  getRankings,
  getStats,
  type CountRecord,
  type ExplorerStats,
  type ProductionFilter,
  type ProductionRecord,
  type RankingWindow,
} from "../../lib/indexer";
import {isAddress, isTxHash, isUuid, shortHash, shortUuid} from "../../utils/explorer-format";
import {getEntityPath, getTrackingPath} from "../../utils/routing";
import {ProfileFooter} from "../tracking/shared";

import {Productions} from "./productions";
import {Rankings} from "./rankings";
import {StatsStrip} from "./stats";

const PAGE_SIZE = 25;
const POLL_MS = 20_000;
const RANGES = {"24h": 1, "7d": 7, "30d": 30} as const;
type Range = keyof typeof RANGES | "all";

//-- Everything the list shows is in the query string, so a filtered view can be shared or bookmarked.
interface ExplorerQuery {
  range: Range;
  producer?: string;
  product?: string;
  inputs: boolean;
  fresh: boolean;
  q?: string;
  tx?: string;
  page: number;
  view: "table" | "grid";
}

function readQuery(queries: Record<string, string>): ExplorerQuery {
  return {
    range: (["24h", "7d", "30d"].includes(queries.range) ? queries.range : "all") as Range,
    producer: queries.producer || undefined,
    product: queries.product || undefined,
    inputs: queries.inputs === "1",
    fresh: queries.fresh === "1",
    q: queries.q || undefined,
    tx: queries.tx || undefined,
    page: Math.max(1, Number(queries.page) || 1),
    view: queries.view === "grid" ? "grid" : "table",
  };
}

function writeQuery(query: ExplorerQuery): string {
  const params = new URLSearchParams();
  if (query.range !== "all") params.set("range", query.range);
  if (query.producer) params.set("producer", query.producer);
  if (query.product) params.set("product", query.product);
  if (query.inputs) params.set("inputs", "1");
  if (query.fresh) params.set("fresh", "1");
  if (query.q) params.set("q", query.q);
  if (query.tx) params.set("tx", query.tx);
  if (query.page > 1) params.set("page", String(query.page));
  if (query.view === "grid") params.set("view", "grid");
  const text = params.toString();
  return text ? `/?${text}` : "/";
}

//-- Case- and diacritic-insensitive, so "khe may" finds "Khe Mây" and "dac san" finds "đặc sản".
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

export default function ExplorerPage() {
  const navigator = useNavigator();
  const [lang] = useLanguage();
  const query = readQuery(navigator.getQueries());
  const setQuery = useCallback(
    (patch: Partial<ExplorerQuery>, keepPage = false) => {
      const next = {...readQuery(navigator.getQueries()), ...patch};
      if (!keepPage) next.page = patch.page ?? 1;
      navigator.navigate(writeQuery(next), {replace: true});
    },
    [navigator],
  );

  const [now, setNow] = useState(() => Date.now());
  const [stats, setStats] = useState<ExplorerStats | null>();
  const [rankingWindow, setRankingWindow] = useState<RankingWindow>("30d");
  const [rankings, setRankings] = useState<{producers: CountRecord[]; products: CountRecord[]} | null>();
  const [options, setOptions] = useState<{producers: string[]; products: {productUuid: string; entity?: string}[]}>({
    producers: [],
    products: [],
  });
  //-- Each result remembers which filter and page it answers; a result for another key means "loading".
  const [result, setResult] = useState<{key: string; records: ProductionRecord[]; hasMore: boolean}>();
  const [failure, setFailure] = useState<{key: string; message: string}>();
  const [newCount, setNewCount] = useState(0);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);
  const [searchText, setSearchText] = useState(query.q ?? "");
  const [searchNote, setSearchNote] = useState<string>();

  //-- Names for everything on screen: the list, the rankings and the filter menus.
  const productPairs = useMemo(() => {
    const pairs = new Map<string, string | undefined>();
    for (const option of options.products) pairs.set(option.productUuid, option.entity);
    for (const record of result?.records ?? []) pairs.set(record.productUuid, record.entity);
    return [...pairs.entries()].map(([productUuid, entity]) => ({productUuid, entity}));
  }, [options.products, result]);
  const producerIds = useMemo(
    () => [...new Set([...options.producers, ...(result?.records ?? []).map((record) => record.entity)])],
    [options.producers, result],
  );
  const names = useExplorerNames(producerIds, productPairs);

  //-- Free text resolves to producer and product ids by name; the indexer then filters on those ids.
  const search = useMemo(() => {
    if (!query.q) return undefined;
    const needle = fold(query.q);
    return {
      producers: options.producers.filter((address) => fold(names.producers[address]?.name ?? "").includes(needle)),
      products: options.products
        .map((option) => option.productUuid)
        .filter((uuid) => fold(names.products[uuid]?.name ?? "").includes(needle)),
    };
  }, [query.q, options, names]);

  //-- A stable string for the whole filter: effects key on it, so a re-render with the same filter
  //-- does not refetch, and "Try again" bumps reloadKey to force one.
  const filterKey = JSON.stringify({
    sinceDays: query.range === "all" ? undefined : RANGES[query.range],
    producers: query.producer ? [query.producer] : undefined,
    products: query.product ? [query.product] : undefined,
    hasInputs: query.inputs || undefined,
    notExpired: query.fresh || undefined,
    txHash: query.tx,
    search,
  } satisfies ProductionFilter);
  const filter = useMemo(() => JSON.parse(filterKey) as ProductionFilter, [filterKey]);
  const pageKey = `${filterKey}|${query.page}|${reloadKey}`;
  const filtered = Boolean(query.range !== "all" || query.producer || query.product || query.inputs || query.fresh || query.q || query.tx);

  useEffect(() => {
    getStats(30).then(setStats, () => setStats(null));
    getFilterOptions().then(setOptions, () => undefined);
  }, [reloadKey]);

  useEffect(() => {
    getRankings(rankingWindow, 5).then(setRankings, () => setRankings(null));
  }, [rankingWindow, reloadKey]);

  const newestSeen = useRef(0);
  useEffect(() => {
    let active = true;
    getProductions(filter, PAGE_SIZE, (query.page - 1) * PAGE_SIZE).then(
      (loaded) => {
        if (!active) return;
        setResult({key: pageKey, ...loaded});
        setNow(Date.now());
        setNewCount(0);
        if (query.page === 1) newestSeen.current = Number(loaded.records[0]?.blockTimestamp ?? Math.floor(Date.now() / 1000));
      },
      (reason: Error) => active && setFailure({key: pageKey, message: reason.message}),
    );
    return () => {
      active = false;
    };
  }, [filter, query.page, pageKey]);

  const page = result?.key === pageKey ? result : undefined;
  const error = failure?.key === pageKey ? failure.message : undefined;

  //-- Live: count newer productions in the background and offer them, rather than shifting the rows
  //-- under the reader. Only on the first page, where new rows would appear.
  useEffect(() => {
    if (query.page !== 1) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
      if (document.hidden || !newestSeen.current) return;
      countProductionsAfter(filter, newestSeen.current).then(setNewCount, () => undefined);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [filter, query.page]);

  const showNew = () => {
    const before = new Set(page?.records.map((record) => record.id));
    getProductions(filter, PAGE_SIZE, 0).then((loaded) => {
      setResult({key: pageKey, ...loaded});
      setNewCount(0);
      setNow(Date.now());
      newestSeen.current = Number(loaded.records[0]?.blockTimestamp ?? newestSeen.current);
      setFresh(new Set(loaded.records.filter((record) => !before.has(record.id)).map((record) => record.id)));
      getStats(30).then(setStats, () => undefined);
    });
  };

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
    const text = searchText.trim();
    setSearchNote(undefined);
    if (!text) {
      setQuery({q: undefined, tx: undefined});
      return;
    }

    if (isUuid(text)) {
      const found = await findProductionsByUuid(text).catch(() => []);
      if (found.length) {
        navigator.navigate(getTrackingPath(found[0].productionUuid));
        return;
      }
      if (options.products.some((option) => option.productUuid === text.toLowerCase())) {
        setQuery({product: text.toLowerCase(), q: undefined, tx: undefined});
        setSearchText("");
        return;
      }
      setSearchNote(getText(<Tlt template="No production or product with this ID on Base." />, lang));
      return;
    }
    if (isTxHash(text)) {
      setQuery({tx: text.toLowerCase(), q: undefined});
      return;
    }
    if (isAddress(text)) {
      navigator.navigate(getEntityPath(text.toLowerCase()));
      return;
    }
    setQuery({q: text, tx: undefined});
  };

  const producerLabel = (address: string) => names.producers[address]?.name || shortHash(address);
  const productLabel = (uuid: string) => names.products[uuid]?.name || shortUuid(uuid);
  const firstRow = (query.page - 1) * PAGE_SIZE + 1;
  const total = !filtered ? stats?.global?.productionCount : undefined;

  return (
    <div className="landing-page">
      <div className="landing-page-content">
        <section className="ex-hero">
          <div className="wrap">
            <p className="eyebrow">
              <Tlt template="Explorer" />
            </p>
            <h1 className="h-3 ex-title">
              <Tlt template="Every production recorded on proChain" />
            </h1>
            <p className="muted">
              <Tlt template="Each production batch is minted on Base. This list is read from the chain, newest first." />
            </p>
            <form className="ex-search" onSubmit={onSearch} role="search">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={getText(
                  <Tlt template="Search by production ID, transaction hash, producer address, producer or product name" />,
                  lang,
                )}
                aria-label={getText(<Tlt template="Search" />, lang)}
              />
              <button type="submit">
                <Tlt template="Search" />
              </button>
            </form>
            {searchNote && <p className="small danger ex-search-note">{searchNote}</p>}
          </div>
        </section>

        <main className="wrap ex-main">
          <StatsStrip stats={stats} />

          <div className="ex-cols">
            <section className="ex-panel" aria-label="Productions">
              <header className="ex-panel-h">
                <h2 className="h-4">
                  <Tlt template="Latest productions" />
                </h2>
                <span className="ex-live">
                  <span className="dot" />
                  <Tlt template="Live" />
                </span>
                <div className="ex-seg ex-grow" role="group">
                  <button type="button" className={query.view === "table" ? "on" : undefined} onClick={() => setQuery({view: "table"}, true)}>
                    <Rows3 size={14} />
                    <Tlt template="Table" />
                  </button>
                  <button type="button" className={query.view === "grid" ? "on" : undefined} onClick={() => setQuery({view: "grid"}, true)}>
                    <LayoutGrid size={14} />
                    <Tlt template="Grid" />
                  </button>
                </div>
              </header>

              <div className="ex-filters">
                {(["all", "24h", "7d", "30d"] as Range[]).map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={`ex-chip${query.range === range ? " on" : ""}`}
                    onClick={() => setQuery({range})}
                  >
                    {range === "all" ? <Tlt template="All time" /> : range}
                  </button>
                ))}
                <span className="ex-sep" />
                <select
                  className={`ex-chip${query.producer ? " on" : ""}`}
                  value={query.producer ?? ""}
                  onChange={(event) => setQuery({producer: event.target.value || undefined})}
                  aria-label={getText(<Tlt template="Producer" />, lang)}
                >
                  <option value="">{getText(<Tlt template="All producers" />, lang)}</option>
                  {options.producers.map((address) => (
                    <option key={address} value={address}>
                      {producerLabel(address)}
                    </option>
                  ))}
                </select>
                <select
                  className={`ex-chip${query.product ? " on" : ""}`}
                  value={query.product ?? ""}
                  onChange={(event) => setQuery({product: event.target.value || undefined})}
                  aria-label={getText(<Tlt template="Product" />, lang)}
                >
                  <option value="">{getText(<Tlt template="All products" />, lang)}</option>
                  {options.products.map((option) => (
                    <option key={option.productUuid} value={option.productUuid}>
                      {productLabel(option.productUuid)}
                    </option>
                  ))}
                </select>
                <button type="button" className={`ex-chip${query.inputs ? " on" : ""}`} onClick={() => setQuery({inputs: !query.inputs})}>
                  <Tlt template="Has inputs" />
                </button>
                <button type="button" className={`ex-chip${query.fresh ? " on" : ""}`} onClick={() => setQuery({fresh: !query.fresh})}>
                  <Tlt template="Not expired" />
                </button>
                {query.q && (
                  <button type="button" className="ex-chip on" onClick={() => (setSearchText(""), setQuery({q: undefined}))}>
                    <Tlt template="Search: {text}" data={{text: query.q}} />
                    <X size={12} />
                  </button>
                )}
                {query.tx && (
                  <button type="button" className="ex-chip on" onClick={() => (setSearchText(""), setQuery({tx: undefined}))}>
                    <Tlt template="Transaction: {hash}" data={{hash: shortHash(query.tx)}} />
                    <X size={12} />
                  </button>
                )}
                {filtered && (
                  <button
                    type="button"
                    className="ex-clear small"
                    onClick={() => (setSearchText(""), navigator.navigate(writeQuery(readQuery({view: query.view})), {replace: true}))}
                  >
                    <Tlt template="Clear filters" />
                  </button>
                )}
              </div>

              {newCount > 0 && query.page === 1 && (
                <button type="button" className="ex-newbar" onClick={showNew}>
                  {newCount === 1 ? (
                    <Tlt template="1 new production. Show it." />
                  ) : (
                    <Tlt template="{count} new productions. Show them." data={{count: newCount >= 100 ? "100+" : String(newCount)}} />
                  )}
                </button>
              )}

              {error ? (
                <div className="ex-state">
                  <p className="danger">
                    <Tlt template="Cannot read productions from the indexer." />
                  </p>
                  <p className="faint small mono">{error}</p>
                  <button type="button" className="button compact" onClick={() => setReloadKey((key) => key + 1)}>
                    <Tlt template="Try again" />
                  </button>
                </div>
              ) : !page ? (
                <div className="ex-state">
                  <Spinner size={28} />
                </div>
              ) : !page.records.length ? (
                <div className="ex-state">
                  <p className="muted">
                    {filtered ? <Tlt template="No productions match these filters." /> : <Tlt template="No productions recorded yet." />}
                  </p>
                </div>
              ) : (
                <Productions
                  view={query.view}
                  records={page.records}
                  fresh={fresh}
                  producers={names.producers}
                  products={names.products}
                  now={now}
                />
              )}

              {page && page.records.length > 0 && (
                <footer className="ex-pager">
                  <span className="small faint">
                    {total !== undefined ? (
                      <Tlt
                        template="{from}–{to} of {total}"
                        data={{from: String(firstRow), to: String(firstRow + page.records.length - 1), total: String(total)}}
                      />
                    ) : (
                      <Tlt template="{from}–{to}" data={{from: String(firstRow), to: String(firstRow + page.records.length - 1)}} />
                    )}
                  </span>
                  <span className="ex-grow" />
                  <button type="button" className="button compact" disabled={query.page === 1} onClick={() => setQuery({page: 1})}>
                    <Tlt template="Newest" />
                  </button>
                  <button
                    type="button"
                    className="button compact"
                    disabled={query.page === 1}
                    onClick={() => setQuery({page: query.page - 1})}
                  >
                    ‹ <Tlt template="Newer" />
                  </button>
                  <span className="small mono">{query.page}</span>
                  <button
                    type="button"
                    className="button compact"
                    disabled={!page.hasMore}
                    onClick={() => setQuery({page: query.page + 1})}
                  >
                    <Tlt template="Older" /> ›
                  </button>
                </footer>
              )}
            </section>

            <Rankings
              window={rankingWindow}
              onWindowChange={setRankingWindow}
              rankings={rankings}
              producers={names.producers}
              products={names.products}
              onPickProducer={(address) => setQuery({producer: address})}
              onPickProduct={(uuid) => setQuery({product: uuid})}
            />
          </div>
        </main>

        <ProfileFooter />
      </div>
    </div>
  );
}
