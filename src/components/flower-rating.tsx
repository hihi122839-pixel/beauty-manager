type FlowerRatingProps = {
  value: number;
  size?: "sm" | "md";
  onChange?: (value: number) => void;
};

export function FlowerRating({ value, size = "md", onChange }: FlowerRatingProps) {
  const flowerSize = size === "sm" ? "text-[10px]" : "text-sm";
  const flowers = [1, 2, 3, 4, 5];

  return (
    <span
      className={["inline-flex shrink-0 items-center gap-px leading-none", flowerSize].join(" ")}
      aria-label={`满意度 ${value} 分`}
    >
      {flowers.map((score) => {
        const filled = score <= value;
        if (onChange) {
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={[
                "leading-none transition",
                filled ? "text-[#B88762]" : "text-[#E8DDD0]",
              ].join(" ")}
              aria-label={`满意度 ${score} 分`}
            >
              ✿
            </button>
          );
        }
        return (
          <span key={score} className={filled ? "text-[#B88762]" : "text-[#E8DDD0]"}>
            ✿
          </span>
        );
      })}
    </span>
  );
}
