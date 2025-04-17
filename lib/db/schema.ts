import { relations } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  mysqlEnum,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
  customerId: varchar("customer_id", { length: 255 }).unique().notNull(),
});

export const teams = mysqlTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 255,
  }).unique(),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

export const teamMembers = mysqlTable("team_members", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => users.id),
  teamId: bigint("team_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => teams.id),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const buyRecord = mysqlTable("buy_record", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id", { length: 255 }).notNull(), // references to customer in stripe
  productId: varchar("product_id", { length: 255 }).notNull(), // references to product in stripe
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  status: mysqlEnum("status", [
    "paid",
    "unpaid",
    "no_payment_required",
  ]).notNull(),
  refunded: boolean("refunded").notNull().default(false),
});

export const activityLogs = mysqlTable("activity_logs", {
  id: serial("id").primaryKey(),
  teamId: bigint("team_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => teams.id),
  userId: bigint("user_id", { unsigned: true, mode: "number" }).references(
    () => users.id
  ),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

export const invitations = mysqlTable("invitations", {
  id: serial("id").primaryKey(),
  teamId: bigint("team_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => teams.id),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: bigint("invited_by", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

export const modules = mysqlTable("modules", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull(), // references to product in stripe
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  order: int("order").notNull(),
  isExtraContent: boolean("is_extra_content").notNull().default(false),
});

export const lessons = mysqlTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: bigint("module_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => modules.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("content_types", ["MDX", "VIDEO"]).notNull(),
  content: text("content").notNull(),
  order: int("order").notNull(),
});

export const modulesRelations = relations(modules, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type BuyAction = typeof buyRecord.$inferSelect;
export type NewBuyAction = typeof buyRecord.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
};
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type ModuleLesson = typeof lessons.$inferSelect;
export type NewModuleLesson = typeof lessons.$inferInsert;

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
}

export enum ContentType {
  MDX = "MDX",
  VIDEO = "VIDEO",
}
