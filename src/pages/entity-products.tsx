import {Tlt} from "@clairejs/react";
import {useEffect, useState} from "react";
import {Link, useNavigator} from "@clairejs/react-web";
import {BadgeCheck, ChevronLeft, ChevronRight} from "lucide-react";

import {ImageWithFallback} from "../components/image-with-fallback";
import {Spinner} from "../components/spinner";
import {useBreakpoints} from "../hooks/use-breakpoints";
import {getEntitySelf, getPeerProducts} from "../lib/api";
import {getEntityPeerUrlRpc} from "../lib/on-chain";
import type {EntityProfileObject, ProductObject} from "../types/tracking";

import {ProfileFooter, SectionWrapper} from "./tracking/shared";

const LIMIT = 10;

export default function EntityProductsPage() {
  const {uuid: address} = useNavigator().getParams() as {uuid?: string};
  const entityAddress = address || "";
  const {mini} = useBreakpoints();
  const [entity, setEntity] = useState<EntityProfileObject | null>();
  const [products, setProducts] = useState<ProductObject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [peerUrl, setPeerUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!entityAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const url = await getEntityPeerUrlRpc(entityAddress);
        if (!url) {
          if (active) {
            setEntity(null);
            setLoading(false);
          }
          return;
        }

        const entityData = await getEntitySelf(url);
        if (active) {
          setEntity(entityData);
          setPeerUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch entity", error);
        if (active) setEntity(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [entityAddress]);

  useEffect(() => {
    if (!peerUrl) return;

    let active = true;

    const loadProducts = async () => {
      try {
        const result = await getPeerProducts(peerUrl, LIMIT, page);
        if (active) {
          setProducts(result.records);
          setTotal(result.total);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    void loadProducts();
    return () => {
      active = false;
    };
  }, [peerUrl, page]);

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

  if (!entity) {
    return (
      <div className="landing-page" style={{width: "100%"}}>
        <div className="landing-page-content" style={{minHeight: "100vh", justifyContent: "center"}}>
          <div className="flex flex-col items-center justify-center" style={{gap: 21, padding: 24}}>
            <span className="font-bold" style={{fontSize: 24, color: "var(--lp-text-heading)"}}>
              <Tlt template="Entity Not Found" />
            </span>
            <Link className="button primary" to="/">
              <Tlt template="Go To Tracking" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="landing-page" style={{width: "100%"}}>
      <div className="landing-page-content" style={{minHeight: "100vh"}}>
        <SectionWrapper
          mini={mini}
          padding={mini ? "24px 24px 0" : "32px max(40px, calc((100% - 1120px) / 2 + 40px)) 0"}
        >
          <Link className="button compact" to={`/e/${entityAddress}`} style={{display: "inline-flex", alignItems: "center", gap: 4}}>
            <ChevronLeft size={16} />
            <Tlt template="Back to profile" />
          </Link>
        </SectionWrapper>

        {/* Entity header */}
        <SectionWrapper mini={mini} padding={mini ? "20px 24px" : "28px max(40px, calc((100% - 1120px) / 2 + 40px))"}>
          <div
            className="flex flex-row items-center"
            style={{
              gap: 16,
              padding: mini ? 16 : 20,
              borderRadius: 16,
              background: "var(--lp-glass-bg)",
              border: "1px solid var(--lp-glass-border)",
            }}
          >
            <ImageWithFallback uri={entity.photo_url || entity.banner_image} width={48} style={{borderRadius: 12, flexShrink: 0}} />
            <div className="flex flex-col" style={{gap: 4}}>
              <div className="flex flex-row items-center" style={{gap: 8}}>
                <span className="font-semibold" style={{fontSize: 16, color: "var(--lp-text-heading)"}}>{entity.name}</span>
                {entity.on_chain && <BadgeCheck size={16} style={{color: "var(--lp-brand)"}} />}
              </div>
              {entity.address && (
                <span style={{fontSize: 12, color: "var(--lp-text-muted)"}}>{entity.address}</span>
              )}
            </div>
          </div>
        </SectionWrapper>

        {/* Products list */}
        <SectionWrapper mini={mini}>
          <div className="flex flex-col" style={{gap: 16}}>
            <span className="font-bold" style={{fontSize: 20, color: "var(--lp-text-heading)"}}>
              <Tlt template="Products" />
            </span>

            {products.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  gap: 13,
                  padding: "48px 24px",
                  borderRadius: 16,
                  background: "var(--lp-glass-bg)",
                  border: "1px solid var(--lp-glass-border)",
                }}
              >
                <span style={{color: "var(--lp-text-muted)", fontSize: 14}}>
                  <Tlt template="No products found" />
                </span>
              </div>
            ) : (
              <div className="flex flex-col" style={{gap: mini ? 12 : 16}}>
                {products.map((product) => (
                  <Link
                    key={product.uuid}
                    to={`/e/${entityAddress}/products/${product.uuid}`}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: mini ? 16 : 21,
                      padding: mini ? 12 : 16,
                      borderRadius: 16,
                      background: "var(--lp-glass-bg)",
                      border: "1px solid var(--lp-glass-border)",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: mini ? 56 : 64,
                        height: mini ? 56 : 64,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                        flexShrink: 0,
                      }}
                    >
                      <ImageWithFallback uri={product.photo_url || ""} width={mini ? 56 : 64} style={{borderRadius: 0}} />
                    </div>
                    <div className="flex flex-col flex-1" style={{gap: 4}}>
                      <span className="font-medium" style={{fontSize: 14, color: "var(--lp-text)"}}>{product.name}</span>
                      {product.unit && (
                        <span style={{fontSize: 13, color: "var(--lp-text-muted)"}}>{product.unit}</span>
                      )}
                    </div>
                    <ChevronRight size={18} style={{color: "var(--lp-text-muted)", flexShrink: 0}} />
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-row items-center justify-center" style={{gap: 12, marginTop: 8}}>
                <button
                  className="button compact"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{display: "inline-flex", alignItems: "center", gap: 4}}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{fontSize: 14, color: "var(--lp-text-muted)"}}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  className="button compact"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{display: "inline-flex", alignItems: "center", gap: 4}}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </SectionWrapper>

        <div style={{flex: 1}} />
        <ProfileFooter mini={mini} />
      </div>
    </div>
  );
}
