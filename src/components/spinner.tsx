export function Spinner({ size = 36 }: { size?: number }) {
    return <div className="spinner" style={{ width: size, height: size }} />;
}
