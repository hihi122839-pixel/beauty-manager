type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "text-sm" : "text-xl";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((score) => {
        const filled = score <= value;
        if (onChange) {
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={[
                starSize,
                "transition",
                filled ? "text-[#B88762]" : "text-[#D7B79A]/40",
              ].join(" ")}
              aria-label={`满意度 ${score} 星`}
            >
              ★
            </button>
          );
        }
        return (
          <span
            key={score}
            className={[starSize, filled ? "text-[#B88762]" : "text-[#D7B79A]/40"].join(
              " "
            )}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
