import { useEffect, useState } from "react";

const queries = {
    xs: "(max-width: 575px)",
    sm: "(min-width: 576px)",
    md: "(min-width: 768px)",
};

const getBreakpoints = () => {
    return {
        xs: window.matchMedia(queries.xs).matches,
        sm: window.matchMedia(queries.sm).matches,
        md: window.matchMedia(queries.md).matches,
    };
};

export const useBreakpoints = () => {
    const [breakpoints, setBreakpoints] = useState(getBreakpoints);

    useEffect(() => {
        const mediaQueries = Object.values(queries).map((query) => window.matchMedia(query));
        const handleChange = () => setBreakpoints(getBreakpoints());

        mediaQueries.forEach((query) => query.addEventListener("change", handleChange));
        return () => {
            mediaQueries.forEach((query) => query.removeEventListener("change", handleChange));
        };
    }, []);

    const mini = breakpoints.xs || (breakpoints.sm && !breakpoints.md);
    return { breakpoints, mini };
};
