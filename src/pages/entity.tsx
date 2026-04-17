import {Tlt} from "@clairejs/react";
import {useEffect, useState} from "react";
import {Link, useNavigator} from "@clairejs/react-web";
import {BadgeCheck} from "lucide-react";

import {ImageWithFallback} from "../components/image-with-fallback";
import {RichText} from "../components/rich-text";
import {Spinner} from "../components/spinner";
import {ValueTypeDisplay} from "../components/value-type-display";
import {useBreakpoints} from "../hooks/use-breakpoints";
import {getEntityDetails, getEntitySelf} from "../lib/api";
import {getEntityPeerUrlRpc} from "../lib/on-chain";
import type {EntityDetailObject, EntityProfileObject} from "../types/tracking";
import {capitalize, isRichTextEmpty} from "../utils/data";

import {ProfileFooter, SectionWrapper} from "./tracking/shared";

export default function EntityPage() {
  const {uuid} = useNavigator().getParams() as {uuid?: string};
  const entityId = uuid || "";
  const {mini} = useBreakpoints();
  const [entity, setEntity] = useState<EntityProfileObject | null>();
  const [entityDetails, setEntityDetails] = useState<EntityDetailObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!entityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setEntity(undefined);

        const peerUrl = await getEntityPeerUrlRpc(entityId);
        if (!peerUrl) {
          if (active) {
            setEntity(null);
            setLoading(false);
          }
          return;
        }

        const [entityData, details] = await Promise.all([
          getEntitySelf(peerUrl),
          getEntityDetails(peerUrl, entityId),
        ]);

        if (active) {
          setEntity(entityData);
          setEntityDetails([...details].sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      } catch (error) {
        console.error("Failed to fetch entity profile", error);
        if (active) {
          setEntity(null);
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
  }, [entityId]);

  if (loading) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div className="landing-page-content" style={{minHeight: "100vh", justifyContent: "center"}}>
          <div className="flex flex-col items-center justify-center" style={{gap: 21}}>
            <Spinner size={60} />
            <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
              <Tlt template="Retrieving entity..." />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div className="landing-page-content" style={{minHeight: "100vh", justifyContent: "center"}}>
          <div className="flex flex-col items-center justify-center" style={{gap: 21, padding: 24}}>
            <span className="font-bold" style={{fontSize: 24, color: "var(--lp-text-heading)"}}>
              <Tlt template="Entity Not Found" />
            </span>
            <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
              <Tlt template="The entity profile you're looking for doesn't exist." />
            </span>
            <Link className="button primary" to="/p">
              <Tlt template="Go To Tracking" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{width: "100%"}}>
      <div className="landing-page-content" style={{minHeight: "100vh"}}>
        {/* Banner image */}
        {entity.banner_image && (
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: mini ? "0 24px" : "0 max(40px, calc((100% - 1120px) / 2 + 40px))",
            }}
          >
            <div style={{borderRadius: 16, overflow: "hidden"}}>
              <img
                src={entity.banner_image}
                style={{width: "100%", maxHeight: 300, objectFit: "cover", display: "block"}}
                alt="banner"
              />
            </div>
          </div>
        )}

        {/* Entity header */}
        <SectionWrapper
          mini={mini}
          padding={mini ? "32px 24px" : "40px max(40px, calc((100% - 1120px) / 2 + 40px))"}
        >
          <div
            className={`flex ${mini ? "flex-col" : "flex-row"} items-start`}
            style={{
              gap: mini ? 24 : 32,
              padding: mini ? 20 : 28,
              borderRadius: 20,
              background: "var(--lp-glass-bg)",
              border: "1px solid var(--lp-glass-border)",
            }}
          >
            <ImageWithFallback
              uri={entity.photo_url || entity.banner_image}
              width={mini ? 120 : 160}
              style={{borderRadius: 20, flexShrink: 0}}
            />
            <div className="flex flex-col flex-1" style={{gap: 14}}>
              <div className="flex flex-col" style={{gap: 6}}>
                <span className="font-bold" style={{fontSize: mini ? 28 : 36, color: "var(--lp-text-heading)"}}>
                  {entity.name}
                </span>
                {!!entity.address && (
                  <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>{entity.address}</span>
                )}
              </div>
              {entity.on_chain && (
                <div className="flex flex-row items-center" style={{gap: 8}}>
                  <BadgeCheck size={16} style={{color: "var(--lp-brand)"}} />
                  <span style={{fontSize: 14, fontWeight: 600, color: "var(--lp-text-heading)"}}>
                    <Tlt template="On-chain verified" />
                  </span>
                </div>
              )}
              {!isRichTextEmpty(entity.description) && (
                <div
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    background: "rgba(127, 127, 127, 0.08)",
                    border: "1px solid var(--lp-glass-border)",
                  }}
                >
                  <RichText value={entity.description} />
                </div>
              )}
              {!!entity.external_links?.length && (
                <div className="flex flex-wrap" style={{gap: 10}}>
                  {entity.external_links.map((link) => (
                    <a
                      key={`${link.name}-${link.url}`}
                      className="button"
                      href={link.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionWrapper>

        {/* Entity details */}
        {entityDetails.length > 0 && (
          <SectionWrapper mini={mini}>
            <div
              className="flex flex-col"
              style={{
                borderRadius: 16,
                background: "var(--lp-glass-bg)",
                border: "1px solid var(--lp-glass-border)",
                overflow: "hidden",
              }}
            >
              {entityDetails.map((detail, i) => (
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
                      minWidth: mini ? 0 : 200,
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
          </SectionWrapper>
        )}

        {/* Featured products */}
        {!!entity.featured_products_expanded?.length && (
          <SectionWrapper mini={mini}>
            <div className="flex flex-col" style={{gap: 16}}>
              <div className="flex flex-row items-center justify-between" style={{gap: 13}}>
                <span className="font-bold" style={{fontSize: 20, color: "var(--lp-text-heading)"}}>
                  <Tlt template="Featured products" />
                </span>
                <Link
                  to={`/e/${entityId}/products`}
                  className="button compact"
                  style={{display: "inline-flex", alignItems: "center", gap: 6}}
                >
                  <Tlt template="All Products" />
                </Link>
              </div>
              <div style={{margin: mini ? -8 : -10, display: "flex", flexWrap: "wrap"}}>
                {entity.featured_products_expanded.map((product) => (
                  <Link
                    key={product.uuid}
                    to={`/e/${entityId}/products/${product.uuid}`}
                    style={{
                      padding: mini ? 8 : 10,
                      width: mini ? "50%" : 200,
                      boxSizing: "border-box",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 16,
                        overflow: "hidden",
                        background: "var(--lp-glass-bg)",
                        border: "1px solid var(--lp-glass-border)",
                        height: "100%",
                      }}
                    >
                      <div className="flex items-center justify-center" style={{width: "100%", backgroundColor: "#ffffff"}}>
                        <ImageWithFallback
                          uri={product.photo_url}
                          width={mini ? 150 : 180}
                          style={{borderRadius: 0}}
                        />
                      </div>
                      <div style={{padding: mini ? 12 : 16}}>
                        <span className="font-medium" style={{fontSize: 13, color: "var(--lp-text)"}}>
                          {product.name}
                        </span>
                        {!!product.unit && (
                          <div style={{fontSize: 12, color: "var(--lp-text-muted)", marginTop: 4}}>{product.unit}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
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
