import {Tlt} from "@clairejs/react";
import {useEffect, useState} from "react";
import {Link, useNavigator} from "@clairejs/react-web";

import {Spinner} from "../../components/spinner";
import {useBreakpoints} from "../../hooks/use-breakpoints";
import {getPublicProduction} from "../../lib/api";
import {discoverProductionInfo} from "../../lib/on-chain";
import type {GetPublicProductionResponseBody} from "../../types/tracking";
import {formatDate} from "../../utils/date";

import {CultivationData} from "./cultivation-data";
import {ProductDescription} from "./product-description";
import {ProductDetails} from "./product-details";
import {TrackingEntity, TrackingName} from "./product-entity";
import {TrackingPhotos} from "./product-photos";
import {TrackingMeasures} from "./production-measures";
import {TrackingIngredients} from "./production-trackings";
import {ProfileFooter, SectionWrapper} from "./shared";

export default function TrackingPage() {
  const {uuid} = useNavigator().getParams() as {uuid?: string};
  const productionId = uuid || "";
  const {mini} = useBreakpoints();
  const [details, setDetails] =
    useState<GetPublicProductionResponseBody | null>();
  const [loading, setLoading] = useState(true);
  const [referenceTime, setReferenceTime] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!productionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setDetails(undefined);

        const info = await discoverProductionInfo(productionId);
        if (!info) {
          if (active) {
            setDetails(null);
          }
          return;
        }

        const response = await getPublicProduction(info.peerUrl, productionId);
        if (active) {
          setDetails(response);
          setReferenceTime(Date.now());
        }
      } catch (error) {
        console.error("Failed to fetch tracking data", error);
        if (active) {
          setDetails(null);
          setReferenceTime(Date.now());
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [productionId]);

  if (!productionId) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div
          className="landing-page-content"
          style={{minHeight: "100vh", justifyContent: "center"}}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{gap: 21, padding: 24}}
          >
            <span
              className="font-bold"
              style={{fontSize: 28, color: "var(--lp-text-heading)"}}
            >
              <Tlt template="Tracking ID required" />
            </span>
            <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
              <Tlt template="Open this site with a production UUID in the path." />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div
          className="landing-page-content"
          style={{minHeight: "100vh", justifyContent: "center"}}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{gap: 21}}
          >
            <Spinner size={60} />
            <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
              <Tlt template="Retrieving data..." />
            </span>
          </div>
        </div>
      </div>
    );
  }

  const production = details?.production;
  const entity = details?.relatedEntities?.find(
    (item) => item.uuid === production?.entity_id,
  );
  const product = details?.relatedProducts?.find(
    (item) => item.uuid === production?.product_id,
  );
  const isExpired = !!(
    production?.expiration_date &&
    referenceTime &&
    production.expiration_date < referenceTime
  );

  if (!entity || !product || !details) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div
          className="landing-page-content"
          style={{minHeight: "100vh", justifyContent: "center"}}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{gap: 21, padding: 24}}
          >
            <span
              className="font-bold"
              style={{fontSize: 24, color: "var(--lp-text-heading)"}}
            >
              <Tlt template="Production Not Found" />
            </span>
            <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
              <Tlt template="The production batch you're looking for doesn't exist." />
            </span>
            <Link className="button primary" to="/p">
              <Tlt template="Go Home" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{width: "100%"}}>
      <div className="landing-page-content" style={{minHeight: "100vh"}}>
        <div className="sections" style={{flex: 1}}>
          <SectionWrapper
            mini={mini}
            padding={
              mini
                ? "32px 24px"
                : "40px max(40px, calc((100% - 1120px) / 2 + 40px))"
            }
          >
            <div
              className={`flex ${mini ? "flex-col" : "flex-row"}`}
              style={{gap: mini ? 24 : 40, overflow: "hidden"}}
            >
              <div style={{...(!mini && {flex: 1}), minWidth: 0}}>
                <TrackingPhotos product={product} production={production} />
              </div>
              <div
                className="flex flex-col"
                style={{...(!mini && {flex: 1}), gap: 24}}
              >
                <TrackingName product={product} />
                {production && (
                  <div className="flex flex-row flex-wrap" style={{gap: 12}}>
                    {production.quantity != null && (
                      <div
                        className="flex flex-col"
                        style={{
                          padding: "10px 16px",
                          borderRadius: 12,
                          background: "var(--lp-glass-bg)",
                          border: "1px solid var(--lp-glass-border)",
                          gap: 2,
                        }}
                      >
                        <span
                          style={{fontSize: 11, color: "var(--lp-text-muted)"}}
                        >
                          <Tlt template="Total Amount" />
                        </span>
                        <span
                          className="font-semibold"
                          style={{
                            fontSize: 16,
                            color: "var(--lp-text-heading)",
                          }}
                        >
                          {production.quantity.toLocaleString()}{" "}
                          {product.unit || ""}
                        </span>
                      </div>
                    )}
                    {!!production.expiration_date && (
                      <div
                        className="flex flex-col"
                        style={{
                          padding: "10px 16px",
                          borderRadius: 12,
                          background: "var(--lp-glass-bg)",
                          border: "1px solid var(--lp-glass-border)",
                          gap: 2,
                        }}
                      >
                        <span
                          style={{fontSize: 11, color: "var(--lp-text-muted)"}}
                        >
                          <Tlt template="Expiration Date" />
                        </span>
                        <span
                          className="font-semibold"
                          style={{
                            fontSize: 16,
                            color: isExpired
                              ? "#ff4d4f"
                              : "var(--lp-text-heading)",
                          }}
                        >
                          {formatDate(production.expiration_date)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div style={{gap: 8}} className="flex flex-col">
                  <span style={{fontSize: 13, color: "var(--lp-text-muted)"}}>
                    <Tlt template="Product of" />
                  </span>
                  <TrackingEntity entity={entity} />
                </div>
                <ProductDescription product={product} />
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper mini={mini}>
            <div
              className={`flex ${mini ? "flex-col" : "flex-row"} items-start`}
              style={{gap: mini ? 24 : 32}}
            >
              <div
                className="flex flex-col"
                style={{...(!mini ? {flex: 1} : {width: "100%"}), gap: 24}}
              >
                <TrackingIngredients details={details} />
                <TrackingMeasures
                  properties={details.productProperties || []}
                  trackings={details.trackingDetails || []}
                />
                {details.cultivationData && (
                  <CultivationData data={details.cultivationData} />
                )}
              </div>
              <div
                className="flex flex-col"
                style={{...(!mini ? {flex: 1} : {width: "100%"}), gap: 24}}
              >
                <ProductDetails details={details.productDetails} />
              </div>
            </div>
          </SectionWrapper>

          <div style={{flex: 1}} />

          <ProfileFooter mini={mini} />
        </div>
      </div>
    </div>
  );
}
