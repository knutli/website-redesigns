type Field = { label: string; value: string | null | undefined };

type Props = {
  team?: string | null;
  season?: string | null;
  player?: string | null;
  size?: string | null;
  type?: string | null;
  condition?: string | null;
  brand?: string | null;
  authenticity?: string | null;
};

function Cell({ label, value }: Field) {
  return (
    <div className="bg-card px-4 py-3.5">
      <div className="text-[11px] font-medium uppercase tracking-badge text-text-tertiary">
        {label}
      </div>
      <div className="mt-[3px] text-sm font-medium text-foreground">
        {value || <span className="text-text-tertiary">N/A</span>}
      </div>
    </div>
  );
}

export function ShirtDetailsGrid(props: Props) {
  const rows: [Field, Field][] = [
    [{ label: "Team", value: props.team }, { label: "Season", value: props.season }],
    [{ label: "Player", value: props.player }, { label: "Size", value: props.size }],
    [{ label: "Type", value: props.type }, { label: "Condition", value: props.condition }],
    [{ label: "Brand", value: props.brand }, { label: "Authenticity", value: props.authenticity }],
  ];

  return (
    <div className="px-4 pt-5">
      <h2 className="mb-3.5 font-display text-lg font-semibold tracking-tight text-foreground">
        Shirt Details
      </h2>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border">
        {rows.map(([left, right]) => (
          <div key={left.label} className="contents">
            <Cell {...left} />
            <Cell {...right} />
          </div>
        ))}
      </div>
    </div>
  );
}
