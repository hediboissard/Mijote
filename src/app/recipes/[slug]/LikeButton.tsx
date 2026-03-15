"use client";

import { useFormStatus } from "react-dom";
import { useOptimistic } from "react";
import { Heart } from "lucide-react";

interface Props {
  isLiked: boolean;
  likesCount: number;
  action: () => Promise<void>;
}

export default function LikeButton({ isLiked, likesCount, action }: Props) {
  const { pending } = useFormStatus();

  const [optimisticState, addOptimistic] = useOptimistic(
    { liked: isLiked, count: likesCount },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    }),
  );

  return (
    <form
      className="inline-flex items-center"
      action={async () => {
        addOptimistic(undefined);
        await action();
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] transition hover:text-[#e76f51] disabled:opacity-60"
      >
        <Heart
          className={`h-4 w-4 ${optimisticState.liked ? "fill-[#e76f51] text-[#e76f51]" : ""}`}
        />
        <span>{optimisticState.count}</span>
      </button>
    </form>
  );
}
