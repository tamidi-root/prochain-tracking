interface Props {
    value?: string;
}

export function RichText({ value }: Props) {
    return <div className="rich-text" dangerouslySetInnerHTML={{ __html: value || "" }} />;
}
