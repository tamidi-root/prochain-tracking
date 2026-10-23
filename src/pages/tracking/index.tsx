import {Tlt} from "@clairejs/react";
import {CheckCircle2} from "lucide-react";
import {useEffect, useState, type CSSProperties} from "react";
import {useNavigator} from "@clairejs/react-web";

import {Spinner} from "../../components/spinner";
import {config} from "../../config/config";
import {getPublicProduction} from "../../lib/api";
import {discoverProductionInfo} from "../../lib/on-chain";
import type {GetPublicProductionResponseBody} from "../../types/tracking";
import {formatPublicCode} from "../../utils/public-code";
import {formatDate} from "../../utils/date";

import {CultivationData} from "./cultivation-data";
import {ProductDescription} from "./product-description";
import {ProductDetails} from "./product-details";
import {TrackingEntity} from "./product-entity";
import {TrackingPhotos} from "./product-photos";
import {TrackingMeasures} from "./production-measures";
import {OnChainProof} from "./on-chain-proof";
import {TrackingIngredients} from "./production-trackings";
import {useLookupUrl} from "../../hooks/use-lookup-url";
import {ProfileFooter} from "./shared";

function StatePage({
  title,
  body,
  action,
}: {
  title?: React.ReactNode;
  body: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="landing-page">
      <div className="state">
        {title && <h1 className="h-3">{title}</h1>}
        <p className="muted">{body}</p>
        {action}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const {uuid} = useNavigator().getParams() as {uuid?: string};
  const productionId = uuid || "";
  const lookupUrl = useLookupUrl();
  const [details, setDetails] =
    useState<GetPublicProductionResponseBody | null>();
  const [loading, setLoading] = useState(true);
  const [referenceTime, setReferenceTime] = useState<number | null>(null);
  const [onChainProductionDate, setOnChainProductionDate] = useState<
    number | null
  >(null);
  const [producerAddress, setProducerAddress] = useState<string>();

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
        setOnChainProductionDate(null);
        setProducerAddress(undefined);

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
          setOnChainProductionDate(info.producedAt);
          setProducerAddress(info.entityAddress);
        }
      } catch (error) {
        console.error("Failed to fetch tracking data", error);
        if (active) {
          setDetails(null);
          setReferenceTime(Date.now());
          setOnChainProductionDate(null);
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
      <StatePage
        title={<Tlt template="Tracking ID required" />}
        body={<Tlt template="Open this site with a production UUID in the path." />}
      />
    );
  }

  if (loading) {
    return (
      <StatePage
        title={<Spinner size={40} />}
        body={<Tlt template="Retrieving data..." />}
      />
    );
  }

  const production = details?.production;
  const entity = details?.relatedEntities?.find(
    (item) => item.uuid === production?.entity_id,
  );
  const product = details?.relatedProducts?.find(
    (item) => item.uuid === production?.product_id,
  );
  const lotCode = formatPublicCode(entity?.short_name, production?.readable_id);
  const isExpired = !!(
    production?.expiration_date &&
    referenceTime &&
    production.expiration_date < referenceTime
  );

  if (!entity || !product || !details || !production) {
    return (
      <StatePage
        title={<Tlt template="Production Not Found" />}
        body={<Tlt template="The production batch you're looking for doesn't exist." />}
        action={
          <a className="btn btn-primary btn-sm" href={lookupUrl}>
            <Tlt template="Look up another code" />
          </a>
        }
      />
    );
  }

  const productionContractUrl = `${config.BLOCK_EXPLORER_URL}/address/${config.PRODUCTION_CONTRACT_ADDRESS}`;

  return (
    <div className="landing-page">
      <div className="landing-page-content">
        <article className="wrap batch">
          <header className="grid head">
            <div
              className="col-7 stack"
              style={{"--stack": "14px"} as CSSProperties}
            >
              {/*-- The code a consumer types on the partner site to reach this page, composed
                    from data this page already fetched rather than taken from the URL: a
                    query parameter would be attacker-controlled, and a provenance label
                    beside chain-verified data is exactly what must not be spoofable. */}
              <p className="mono faint facts">
                <span>
                  <Tlt template="Batch Code" /> {lotCode || production.readable_id || production.uuid}
                </span>
                {production.quantity != null && (
                  <span>
                    {production.quantity.toLocaleString()} {product.unit || ""}
                  </span>
                )}
              </p>
              <p className="mono faint facts">
                {!!onChainProductionDate && (
                  <span>
                    <Tlt template="Production Date" /> {formatDate(onChainProductionDate)}
                  </span>
                )}
                {!!production.expiration_date && (
                  <span className={isExpired ? "danger" : undefined}>
                    <Tlt template="Expiration Date" /> {formatDate(production.expiration_date)}
                    {isExpired && (
                      <>
                        {" · "}
                        <Tlt template="Expired" />
                      </>
                    )}
                  </span>
                )}
              </p>
              <h1 className="h-1">{product.name}</h1>
              {/*-- Reaching this point means batchInfo() on the Production contract returned the
                    lot, so the batch is anchored on-chain. */}
              <p className="verified big">
                <CheckCircle2 size={22} />
                <Tlt template="Verified on-chain" /> ·{" "}
                <a href={productionContractUrl} target="_blank" rel="noopener">
                  <Tlt template="Check" /> ↗
                </a>
              </p>
            </div>
            <div className="col-5">
              <TrackingPhotos product={product} />
            </div>
          </header>

          <TrackingEntity entity={entity} producerAddress={producerAddress} />
          <ProductDescription product={product} />
          <TrackingIngredients details={details} />
          <TrackingMeasures
            properties={details.productProperties || []}
            trackings={details.trackingDetails || []}
          />
          {details.cultivationData && (
            <CultivationData data={details.cultivationData} />
          )}
          <ProductDetails details={details.productDetails} />
          <OnChainProof
            productionId={production.uuid}
            producerAddress={producerAddress}
            producedAt={onChainProductionDate}
          />
        </article>

        <ProfileFooter />
      </div>
    </div>
  );
}
