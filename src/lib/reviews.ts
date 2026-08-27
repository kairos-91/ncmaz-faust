export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_visible: boolean;
  created_at: string;
};

export function averageRating(reviews: Pick<Review, "rating">[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
