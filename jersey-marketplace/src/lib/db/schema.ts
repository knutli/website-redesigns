import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const userStatus = pgEnum("user_status", ["active", "suspended", "banned"]);
export const sellerKyc = pgEnum("seller_kyc", ["none", "pending", "verified", "rejected"]);
export const jerseyStatus = pgEnum("jersey_status", [
  "locker",
  "draft",
  "pending",
  "live",
  "sold",
  "archived",
]);
export const jerseyVisibility = pgEnum("jersey_visibility", ["public", "private"]);
export const listingType = pgEnum("listing_type", ["auction", "fixed"]);
export const listingStatus = pgEnum("listing_status", [
  "draft",
  "pending_review",
  "rejected",
  "live",
  "ended",
  "sold",
  "cancelled",
]);
export const orderStatus = pgEnum("order_status", [
  "awaiting_payment",
  "paid",
  "shipped",
  "delivered",
  "disputed",
  "refunded",
  "cancelled",
]);
export const addressType = pgEnum("address_type", ["shipping", "billing"]);
export const reportStatus = pgEnum("report_status", ["open", "resolved", "dismissed"]);
export const reportKind = pgEnum("report_kind", ["generic", "fake"]);
export const authProvider = pgEnum("auth_provider", ["email", "vipps"]);
export const wantedStatus = pgEnum("wanted_status", ["active", "fulfilled", "archived"]);
export const paymentMethodType = pgEnum("payment_method_type", ["card", "vipps", "klarna"]);
export const threadKind = pgEnum("thread_kind", ["dm", "qa"]);

// ---------------------------------------------------------------------------
// Better Auth tables (kept close to Better Auth's expected shape so we can
// point its Drizzle adapter at them).
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // Oase additions
  handle: text("handle").unique(),
  bio: text("bio"),
  banner: text("banner"),
  favouriteClub: text("favourite_club"),
  location: text("location"),
  country: text("country").default("NO"),
  language: text("language").default("nb"),
  preferredCurrency: text("preferred_currency").notNull().default("NOK"),
  role: userRole("role").notNull().default("user"),
  status: userStatus("status").notNull().default("active"),
  lockerPublic: boolean("locker_public").notNull().default(true),
  birthDate: timestamp("birth_date"),
  primaryAuthProvider: authProvider("primary_auth_provider").notNull().default("email"),
  vippsVerifiedAt: timestamp("vipps_verified_at"),
  verifiedCollector: boolean("verified_collector").notNull().default(false),
  verifiedCollectorAt: timestamp("verified_collector_at"),
  verifiedCollectorBy: text("verified_collector_by"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Seller profile (created on first Vipps sign-in)
// ---------------------------------------------------------------------------

export const sellerProfile = pgTable("seller_profile", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  vippsSub: text("vipps_sub").unique(), // Vipps OIDC subject
  vippsPhone: text("vipps_phone"),
  vippsName: text("vipps_name"),
  stripeAccountId: text("stripe_account_id").unique(),
  kycStatus: sellerKyc("kyc_status").notNull().default("none"),
  payoutsEnabled: boolean("payouts_enabled").notNull().default(false),
  defaultShippingAddressId: uuid("default_shipping_address_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const address = pgTable("address", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: addressType("type").notNull(),
  name: text("name").notNull(),
  street: text("street").notNull(),
  street2: text("street2"),
  city: text("city").notNull(),
  postcode: text("postcode").notNull(),
  country: text("country").notNull().default("NO"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Jerseys + images
// ---------------------------------------------------------------------------

export const jersey = pgTable(
  "jersey",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    club: text("club"),
    country: text("country"),
    season: text("season"),
    player: text("player"),
    size: text("size"),
    condition: text("condition"),
    authenticity: text("authenticity"),
    description: text("description"),
    status: jerseyStatus("status").notNull().default("locker"),
    visibility: jerseyVisibility("visibility").notNull().default("public"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    ownerIdx: index("jersey_owner_idx").on(t.ownerId),
    statusIdx: index("jersey_status_idx").on(t.status),
  }),
);

export const jerseyImage = pgTable(
  "jersey_image",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jerseyId: uuid("jersey_id").notNull().references(() => jersey.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    width: integer("width"),
    height: integer("height"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ jerseyIdx: index("jersey_image_jersey_idx").on(t.jerseyId) }),
);

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export const listing = pgTable(
  "listing",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: text("public_id").notNull().unique(), // e.g. 7F215554
    jerseyId: uuid("jersey_id").notNull().references(() => jersey.id, { onDelete: "cascade" }),
    sellerId: text("seller_id").notNull().references(() => user.id),
    type: listingType("type").notNull(),
    status: listingStatus("status").notNull().default("draft"),

    // Money stored in minor units (øre)
    currency: text("currency").notNull().default("NOK"),
    startPrice: bigint("start_price", { mode: "number" }),
    reservePrice: bigint("reserve_price", { mode: "number" }),
    buyNowPrice: bigint("buy_now_price", { mode: "number" }),
    currentPrice: bigint("current_price", { mode: "number" }),

    endAt: timestamp("end_at"),
    extendedUntil: timestamp("extended_until"),

    submittedAt: timestamp("submitted_at"),
    approvedBy: text("approved_by").references(() => user.id),
    approvedAt: timestamp("approved_at"),
    rejectedAt: timestamp("rejected_at"),
    rejectedReason: text("rejected_reason"),
    rejectedBy: text("rejected_by").references(() => user.id),

    viewCount: integer("view_count").notNull().default(0),
    sourceLanguage: text("source_language"), // language of the seller-written description
    descriptionTranslations: jsonb("description_translations"), // { [lang]: text }

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    sellerIdx: index("listing_seller_idx").on(t.sellerId),
    statusIdx: index("listing_status_idx").on(t.status),
    endAtIdx: index("listing_end_at_idx").on(t.endAt),
    publicIdIdx: uniqueIndex("listing_public_id_idx").on(t.publicId),
  }),
);

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

export const bid = pgTable(
  "bid",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id").notNull().references(() => listing.id, { onDelete: "cascade" }),
    bidderId: text("bidder_id").notNull().references(() => user.id),
    amount: bigint("amount", { mode: "number" }).notNull(),
    maxAmount: bigint("max_amount", { mode: "number" }),
    isProxy: boolean("is_proxy").notNull().default(false),
    ipHash: text("ip_hash"),
    placedAt: timestamp("placed_at").notNull().defaultNow(),
  },
  (t) => ({
    listingIdx: index("bid_listing_idx").on(t.listingId),
    bidderIdx: index("bid_bidder_idx").on(t.bidderId),
  }),
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orderTable = pgTable(
  "order",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id").notNull().references(() => listing.id),
    buyerId: text("buyer_id").notNull().references(() => user.id),
    sellerId: text("seller_id").notNull().references(() => user.id),

    grossAmount: bigint("gross_amount", { mode: "number" }).notNull(),
    platformFeeAmount: bigint("platform_fee_amount", { mode: "number" }).notNull(),
    sellerNetAmount: bigint("seller_net_amount", { mode: "number" }).notNull(),
    shippingAmount: bigint("shipping_amount", { mode: "number" }).notNull().default(0),

    status: orderStatus("status").notNull().default("awaiting_payment"),
    paymentIntentId: text("payment_intent_id").unique(),

    shippingAddressId: uuid("shipping_address_id").references(() => address.id),
    shippedAt: timestamp("shipped_at"),
    trackingNo: text("tracking_no"),
    carrier: text("carrier"),
    deliveredAt: timestamp("delivered_at"),
    refundedAt: timestamp("refunded_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    buyerIdx: index("order_buyer_idx").on(t.buyerId),
    sellerIdx: index("order_seller_idx").on(t.sellerId),
    statusIdx: index("order_status_idx").on(t.status),
  }),
);

// ---------------------------------------------------------------------------
// Wishlist, collections, follows, messages, notifications, reports, audit
// ---------------------------------------------------------------------------

export const wishlist = pgTable(
  "wishlist",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id").notNull().references(() => listing.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.listingId] }) }),
);

export const collection = pgTable("collection", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  coverImage: text("cover_image"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collectionItem = pgTable(
  "collection_item",
  {
    collectionId: uuid("collection_id").notNull().references(() => collection.id, { onDelete: "cascade" }),
    jerseyId: uuid("jersey_id").notNull().references(() => jersey.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => ({ pk: primaryKey({ columns: [t.collectionId, t.jerseyId] }) }),
);

export const follow = pgTable(
  "follow",
  {
    followerId: text("follower_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    followedId: text("followed_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.followerId, t.followedId] }) }),
);

export const messageThread = pgTable("message_thread", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: threadKind("kind").notNull().default("dm"),
  orderId: uuid("order_id").references(() => orderTable.id),
  listingId: uuid("listing_id").references(() => listing.id), // for kind=qa
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const threadParticipant = pgTable(
  "thread_participant",
  {
    threadId: uuid("thread_id").notNull().references(() => messageThread.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.threadId, t.userId] }) }),
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    threadId: uuid("thread_id").notNull().references(() => messageThread.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => user.id),
    body: text("body").notNull(),
    attachments: jsonb("attachments"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ threadIdx: index("message_thread_idx").on(t.threadId) }),
);

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    payload: jsonb("payload").notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ userIdx: index("notification_user_idx").on(t.userId) }),
);

export const report = pgTable("report", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: text("reporter_id").notNull().references(() => user.id),
  targetType: text("target_type").notNull(), // listing | user | message
  targetId: text("target_id").notNull(),
  kind: reportKind("kind").notNull().default("generic"), // "fake" routes to authenticity queue
  reason: text("reason").notNull(),
  details: text("details"),
  status: reportStatus("status").notNull().default("open"),
  resolvedBy: text("resolved_by").references(() => user.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Wanted — reverse marketplace (distinct from wishlist)
// ---------------------------------------------------------------------------

export const wanted = pgTable(
  "wanted",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    club: text("club"),
    country: text("country"),
    season: text("season"),
    sizePref: text("size_pref"),
    player: text("player"),
    description: text("description"),
    maxPriceMinor: bigint("max_price_minor", { mode: "number" }),
    currency: text("currency").notNull().default("NOK"),
    status: wantedStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("wanted_user_idx").on(t.userId),
    statusIdx: index("wanted_status_idx").on(t.status),
    clubIdx: index("wanted_club_idx").on(t.club),
  }),
);

export const wantedImage = pgTable(
  "wanted_image",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    wantedId: uuid("wanted_id").notNull().references(() => wanted.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    order: integer("order").notNull().default(0),
  },
  (t) => ({ wantedIdx: index("wanted_image_wanted_idx").on(t.wantedId) }),
);

// ---------------------------------------------------------------------------
// Saved payment methods — fast checkout + auction-win auto-charge
// ---------------------------------------------------------------------------

export const savedPaymentMethod = pgTable(
  "saved_payment_method",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    stripePaymentMethodId: text("stripe_payment_method_id").notNull().unique(),
    type: paymentMethodType("type").notNull(),
    brand: text("brand"),
    last4: text("last4"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ userIdx: index("saved_payment_method_user_idx").on(t.userId) }),
);

// ---------------------------------------------------------------------------
// Oase Credits — store-credit ledger (M5)
//
// Non-withdrawable by default. Positive deltas = credits granted
// (referral, admin goodwill, return-pack bonus). Negative deltas =
// credits spent (checkout discount) or withdrawn (→ normal Stripe payout).
// Balance = sum(delta_minor) for a user.
// ---------------------------------------------------------------------------

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    deltaMinor: bigint("delta_minor", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("NOK"),
    reason: text("reason").notNull(),
    orderId: uuid("order_id").references(() => orderTable.id),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ userIdx: index("credit_ledger_user_idx").on(t.userId) }),
);

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id").references(() => user.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  at: timestamp("at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ one, many }) => ({
  sellerProfile: one(sellerProfile, { fields: [user.id], references: [sellerProfile.userId] }),
  jerseys: many(jersey),
  bids: many(bid),
  addresses: many(address),
  collections: many(collection),
}));

export const jerseyRelations = relations(jersey, ({ one, many }) => ({
  owner: one(user, { fields: [jersey.ownerId], references: [user.id] }),
  images: many(jerseyImage),
  listings: many(listing),
}));

export const jerseyImageRelations = relations(jerseyImage, ({ one }) => ({
  jersey: one(jersey, { fields: [jerseyImage.jerseyId], references: [jersey.id] }),
}));

export const listingRelations = relations(listing, ({ one, many }) => ({
  jersey: one(jersey, { fields: [listing.jerseyId], references: [jersey.id] }),
  seller: one(user, { fields: [listing.sellerId], references: [user.id] }),
  bids: many(bid),
}));

export const bidRelations = relations(bid, ({ one }) => ({
  listing: one(listing, { fields: [bid.listingId], references: [listing.id] }),
  bidder: one(user, { fields: [bid.bidderId], references: [user.id] }),
}));

// Handy type exports
export type User = typeof user.$inferSelect;
export type Jersey = typeof jersey.$inferSelect;
export type Listing = typeof listing.$inferSelect;
export type Bid = typeof bid.$inferSelect;
export type Order = typeof orderTable.$inferSelect;
export type Wanted = typeof wanted.$inferSelect;
export type SavedPaymentMethod = typeof savedPaymentMethod.$inferSelect;
export type CreditEntry = typeof creditLedger.$inferSelect;
