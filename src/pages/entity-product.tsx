import {Tlt} from "@clairejs/react";
import {useEffect, useState} from "react";
import {Link, useNavigator} from "@clairejs/react-web";
import {BadgeCheck, ChevronLeft} from "lucide-react";

import {ImageWithFallback} from "../components/image-with-fallback";
import {RichText} from "../components/rich-text";
import {Spinner} from "../components/spinner";
import {ValueTypeDisplay} from "../components/value-type-display";
import {useBreakpoints} from "../hooks/use-breakpoints";
import {getEntitySelf, getPeerProduct, type GetPublicProductResponse} from "../lib/api";
import {getEntityPeerUrlRpc} from "../lib/on-chain";
import type {EntityProfileObject} from "../types/tracking";
import {capitalize, isRichTextEmpty} from "../utils/data";

import {ProfileFooter, SectionWrapper} from "./tracking/shared";

export default function EntityProductPage() {
  const {uuid: address, productUuid} = useNavigator().getParams() as {uuid?: string; productUuid?: string};
  const entityAddress = address || "";
  const {mini} = useBreakpoints();
  const [entity, setEntity] = useState<EntityProfileObject | null>();
  const [publicProduct, setPublicProduct] = useState<GetPublicProductResponse | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!entityAddress || !productUuid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const peerUrl = await getEntityPeerUrlRpc(entityAddress);
        if (!peerUrl) {
          if (active) {
            setEntity(null);
            setLoading(false);
          }
          return;
        }

        const [entityData, productData] = await Promise.all([
          getEntitySelf(peerUrl),
          getPeerProduct(peerUrl, productUuid),
        ]);

        if (active) {
          setEntity(entityData);
          setPublicProduct(productData);
        }
      } catch (error) {
        console.error("Failed to fetch product detail", error);
        if (active) {
          setEntity(null);
          setPublicProduct(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [entityAddress, productUuid]);

  if (loading) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div className="landing-page-content" style={{minHeight: "100vh", justifyContent: "center"}}>
          <div className="flex flex-col items-center justify-center" style={{gap: 21}}>
            <Spinner size={60} />
            <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
              <Tlt template="Retrieving data..." />
            </span>
          </div>
        </div>
      </div>
    );
  }

  const product = publicProduct?.product;
  const sortedDetails = [...(publicProduct?.details || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const ingredients = publicProduct?.ingredients || [];

  if (!entity || !product) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div className="landing-page-content" style={{minHeight: "100vh", justifyContent: "center"}}>
          <div className="flex flex-col items-center justify-center" style={{gap: 21, padding: 24}}>
            <span className="font-bold" style={{fontSize: 24, color: "var(--lp-text-heading)"}}>
              <Tlt template="Product Not Found" />
            </span>
            <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
              <Tlt template="The product you're looking for doesn't exist." />
            </span>
            <Link className="button primary" to={`/e/${entityAddress}`}>
              <Tlt template="Go Back" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{width: "100%"}}>
      <div className="landing-page-content" style={{minHeight: "100vh"}}>
        <SectionWrapper
          mini={mini}
          padding={mini ? "24px 24px 0" : "32px max(40px, calc((100% - 1120px) / 2 + 40px)) 0"}
        >
          <Link className="button compact" to={`/e/${entityAddress}`} style={{display: "inline-flex", alignItems: "center", gap: 4}}>
            <ChevronLeft size={16} />
            <Tlt template="Back to Entity" />
          </Link>
        </SectionWrapper>

        <SectionWrapper mini={mini} padding={mini ? "24px" : "32px max(40px, calc((100% - 1120px) / 2 + 40px))"}>
          <div className={`flex ${mini ? "flex-col" : "flex-row"}`} style={{gap: mini ? 24 : 40}}>
            {/* Photo */}
            <div
              className="flex items-center justify-center"
              style={{
                ...(!mini && {flex: 1}),
                aspectRatio: "1 / 1",
                borderRadius: 16,
                backgroundColor: "#ffffff",
                border: "1px solid var(--lp-glass-border)",
                overflow: "hidden",
                padding: 24,
              }}
            >
              <img
                src={product.photo_url || ""}
                style={{width: "100%", height: "100%", objectFit: "contain"}}
                alt="product"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col" style={{...(!mini && {flex: 1}), gap: 24}}>
              <div className="flex flex-col" style={{gap: 8}}>
                <span
                  className="font-bold"
                  style={{fontSize: mini ? 24 : 32, lineHeight: 1.2, color: "var(--lp-text-heading)"}}
                >
                  {product.name}
                </span>
              </div>

              {/* Entity */}
              <div className="flex flex-col" style={{gap: 8}}>
                <span style={{fontSize: 13, color: "var(--lp-text-muted)"}}>
                  <Tlt template="Product of" />
                </span>
                <Link
                  to={`/e/${entityAddress}`}
                  style={{
                    gap: 13,
                    padding: 12,
                    borderRadius: 12,
                    background: "var(--lp-glass-bg)",
                    border: "1px solid var(--lp-glass-border)",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  <ImageWithFallback uri={entity.photo_url || entity.banner_image} width={44} style={{borderRadius: 8}} />
                  <div className="flex flex-col flex-1" style={{gap: 4}}>
                    <div className="flex flex-row items-center" style={{gap: 8}}>
                      <span className="font-medium" style={{fontSize: 14, color: "var(--lp-text)"}}>
                        {entity.name}
                      </span>
                      {entity.on_chain && <BadgeCheck size={16} style={{color: "var(--lp-brand)"}} />}
                    </div>
                    {entity.address && (
                      <span style={{fontSize: 12, color: "var(--lp-text-muted)"}}>{entity.address}</span>
                    )}
                  </div>
                </Link>
              </div>

              {/* Description */}
              {!isRichTextEmpty(product.description) && (
                <div className="flex flex-col" style={{gap: 8}}>
                  <span className="font-medium" style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
                    <Tlt template="Description" />
                  </span>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: "var(--lp-glass-bg)",
                      border: "1px solid var(--lp-glass-border)",
                      color: "var(--lp-text)",
                    }}
                  >
                    <RichText value={product.description} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionWrapper>

        {(sortedDetails.length > 0 || ingredients.length > 0) && (
          <SectionWrapper mini={mini}>
            <div style={{borderTop: "1px solid var(--lp-glass-border)", paddingTop: mini ? 24 : 32}}>
              <div className={`flex ${mini ? "flex-col" : "flex-row"} items-start`} style={{gap: mini ? 24 : 40}}>
                {sortedDetails.length > 0 && (
                  <div className="flex flex-col" style={{...(!mini && {flex: 1}), gap: 16, width: mini ? "100%" : undefined}}>
                    <span className="font-bold" style={{fontSize: 20, color: "var(--lp-text-heading)"}}>
                      <Tlt template="Product details" />
                    </span>
                    <div
                      className="flex flex-col"
                      style={{
                        borderRadius: 16,
                        background: "var(--lp-glass-bg)",
                        border: "1px solid var(--lp-glass-border)",
                        overflow: "hidden",
                      }}
                    >
                      {sortedDetails.map((detail, i) => (
                        <div
                          key={detail.uuid}
                          className={`flex ${mini ? "flex-col" : "flex-row"} items-start`}
                          style={{
                            gap: mini ? 4 : 13,
                            padding: mini ? "16px 20px" : "14px 24px",
                            ...(i > 0 && {borderTop: "1px solid var(--lp-glass-border)"}),
                          }}
                        >
                          <span
                            className="font-medium"
                            style={{
                              fontSize: 13,
                              paddingBlock: mini ? 0 : 7,
                              minWidth: mini ? 0 : 160,
                              color: "var(--lp-text-muted)",
                            }}
                          >
                            {capitalize(detail.name)}
                          </span>
                          <div className="flex-1" style={{color: "var(--lp-text)", paddingBlock: mini ? 0 : 7}}>
                            <ValueTypeDisplay valueType={detail.value_type} value={detail.value} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ingredients.length > 0 && (
                  <div className="flex flex-col" style={{...(!mini && {flex: 1}), gap: 16, width: mini ? "100%" : undefined}}>
                    <span className="font-bold" style={{fontSize: 20, color: "var(--lp-text-heading)"}}>
                      <Tlt template="Ingredients" />
                    </span>
                    <div className="flex flex-col" style={{gap: 12}}>
                      {ingredients.map((ingredient) => (
                        <div
                          key={ingredient.uuid}
                          className="flex flex-row items-center"
                          style={{
                            gap: 13,
                            padding: 12,
                            borderRadius: 12,
                            background: "var(--lp-glass-bg)",
                            border: "1px solid var(--lp-glass-border)",
                          }}
                        >
                          <span className="font-medium" style={{fontSize: 14, color: "var(--lp-text)"}}>
                            {capitalize(ingredient.name)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionWrapper>
        )}

        <div style={{flex: 1}} />
        <ProfileFooter mini={mini} />
      </div>
    </div>
  );
}
