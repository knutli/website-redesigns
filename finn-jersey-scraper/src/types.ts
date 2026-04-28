export interface RawListing {
  finnkode: string;
  url: string;
  title: string;
  description: string;
  priceNok: number | null;
  finnCondition: string | null;
  postedAt: string | null;
  location: string | null;
  imageUrls: string[];
  seller: SellerRef;
}

export interface SellerRef {
  finnUserId: string | null;
  displayName: string | null;
  profileUrl: string | null;
}

export interface ExtractedFields {
  player: string | null;
  season: string | null;
  team: string | null;
  league: string | null;
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | null;
  type: "home" | "away" | "third" | "goalkeeper" | "training" | "other" | null;
  condition: string | null;
  confidence: {
    player: "high" | "medium" | "low";
    season: "high" | "medium" | "low";
    team: "high" | "medium" | "low";
    league: "high" | "medium" | "low";
    size: "high" | "medium" | "low";
    type: "high" | "medium" | "low";
  };
  notes: string | null;
}

export interface ScrapedListing extends RawListing {
  extracted: ExtractedFields;
  images: { url: string; localPath: string }[];
}
