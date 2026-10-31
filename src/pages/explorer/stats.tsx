import {Tlt, useLanguage} from "@clairejs/react";

import type {ExplorerStats} from "../../lib/indexer";
import {formatIsoDate, formatNumber} from "../../utils/explorer-format";

const DAY = 86400;

export function StatsStrip({stats}: {stats: ExplorerStats | null | undefined}) {
  const [lang] = useLanguage();
  const global = stats?.global;
  const daily = stats?.daily ?? [];
  const todayCount = daily.at(-1)?.productionCount ?? 0;
  const weekProducts = daily.slice(-7).reduce((sum, day) => sum + day.newProducts, 0);
  const max = Math.max(1, ...daily.map((day) => day.productionCount));
  const value = (n: number | undefined) => (stats === undefined ? "–" : formatNumber(n ?? 0, lang));

  return (
    <section className="ex-stats" aria-label="Statistics">
      <div className="ex-stat">
        <p className="ex-k">
          <Tlt template="Productions" />
        </p>
        <p className="ex-v num">{value(global?.productionCount)}</p>
        <p className="ex-d">
          <Tlt template="+{count} today" data={{count: formatNumber(todayCount, lang)}} />
        </p>
      </div>
      <div className="ex-stat">
        <p className="ex-k">
          <Tlt template="Producers" />
        </p>
        <p className="ex-v num">{value(global?.producerCount)}</p>
        <p className="ex-d">
          <Tlt template="{count} active in the last 30 days" data={{count: formatNumber(stats?.activeProducers ?? 0, lang)}} />
        </p>
      </div>
      <div className="ex-stat">
        <p className="ex-k">
          <Tlt template="Products produced" />
        </p>
        <p className="ex-v num">{value(stats?.producedProducts)}</p>
        <p className="ex-d">
          <Tlt
            template="{count} registered on-chain, +{week} this week"
            data={{count: formatNumber(global?.productCount ?? 0, lang), week: formatNumber(weekProducts, lang)}}
          />
        </p>
      </div>
      <div className="ex-stat ex-spark-cell">
        <p className="ex-k">
          <Tlt template="Productions per day, last 30 days" />
        </p>
        <div className="ex-spark" role="img" aria-label="Productions per day">
          {daily.map((day) => (
            <span
              key={day.day}
              className={day.productionCount ? undefined : "zero"}
              style={{height: `${Math.max(4, (day.productionCount / max) * 100)}%`}}
              title={`${formatIsoDate(day.day * DAY)}: ${day.productionCount}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
