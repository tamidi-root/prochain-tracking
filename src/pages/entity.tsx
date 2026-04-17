import {Tlt} from "@clairejs/react";
import {useEffect, useState} from "react";
import {Link, useNavigator} from "@clairejs/react-web";
import {BadgeCheck} from "lucide-react";

import {ImageWithFallback} from "../components/image-with-fallback";
import {RichText} from "../components/rich-text";
import {Spinner} from "../components/spinner";
import {useBreakpoints} from "../hooks/use-breakpoints";
import {getEntitySelf} from "../lib/api";
import {getEntityPeerUrlRpc} from "../lib/on-chain";
import type {EntityProfileObject} from "../types/tracking";
import {isRichTextEmpty} from "../utils/data";

import {ProfileFooter, SectionWrapper} from "./tracking/shared";

export default function EntityPage() {
  const {uuid} = useNavigator().getParams() as {uuid?: string};
  const entityId = uuid || "";
  const {mini} = useBreakpoints();
  const [entity, setEntity] = useState<EntityProfileObject | null>();
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
          }
          return;
        }

        const response = await getEntitySelf(peerUrl);
        if (active) {
          setEntity(response);
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
        <SectionWrapper
          mini={mini}
          padding={
            mini
              ? "32px 24px"
              : "40px max(40px, calc((100% - 1120px) / 2 + 40px))"
          }
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
                <span
                  className="font-bold"
                  style={{
                    fontSize: mini ? 28 : 36,
                    color: "var(--lp-text-heading)",
                  }}
                >
                  {entity.name}
                </span>
                {!!entity.address && (
                  <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
                    {entity.address}
                  </span>
                )}
              </div>
              {entity.on_chain && (
                <div className="flex flex-row items-center" style={{gap: 8}}>
                  <BadgeCheck size={16} style={{color: "var(--lp-brand)"}} />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--lp-text-heading)",
                    }}
                  >
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

        {!!entity.featured_products_expanded?.length && (
          <SectionWrapper mini={mini}>
            <div className="flex flex-col" style={{gap: 16}}>
              <span
                className="font-bold"
                style={{fontSize: 20, color: "var(--lp-text-heading)"}}
              >
                <Tlt template="Featured products" />
              </span>
              <div className="flex flex-wrap" style={{gap: 16}}>
                {entity.featured_products_expanded.map((product) => (
                  <div
                    key={product.uuid}
                    className="flex flex-col"
                    style={{
                      width: mini ? "100%" : "calc(33.333% - 11px)",
                      minWidth: mini ? "100%" : 240,
                      padding: 16,
                      borderRadius: 18,
                      background: "var(--lp-glass-bg)",
                      border: "1px solid var(--lp-glass-border)",
                      gap: 12,
                    }}
                  >
                    <ImageWithFallback
                      uri={product.photo_url}
                      style={{borderRadius: 14, aspectRatio: "1 / 1"}}
                    />
                    <div className="flex flex-col" style={{gap: 4}}>
                      <span
                        className="font-semibold"
                        style={{color: "var(--lp-text-heading)"}}
                      >
                        {product.name}
                      </span>
                      {!!product.unit && (
                        <span
                          style={{fontSize: 13, color: "var(--lp-text-muted)"}}
                        >
                          {product.unit}
                        </span>
                      )}
                    </div>
                  </div>
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
