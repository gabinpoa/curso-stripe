import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { NewUser, users } from "../db/schema";
import { cartpanda } from "../cartpanda/instance";

export async function createUser(email: string) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: "Failed to create user. Email already in use. Please try again.",
      email,
    };
  }

  const customersWithSameEmail = await cartpanda.getCustomers({
    email: email,
  });

  if (customersWithSameEmail.customers.length > 1) {
    console.error("Multiple customers found with the same email:", email);
    return {
      error:
        "Multiple customers found with the same email. Please contact support.",
      email,
    };
  } else if (customersWithSameEmail.customers.length !== 1) {
    return {
      error: "No customers found with the provided email.",
      email,
    };
  }

  const customer = customersWithSameEmail.customers[0];
  const customerId = customer.id.toString();
  const userName = customer.first_name && customer.last_name
    ? `${customer.first_name} ${customer.last_name}`
    : null;

  const newUser: NewUser = {
    email,
    customerId,
    name: userName,
  };

  const queryResult = await db.insert(users).values(newUser);

  if (queryResult[0].affectedRows === 0) {
    return {
      error: "Failed to create user. Please try again.",
      email,
    };
  }

  return newUser;
}
