import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { NewUser, users } from "../db/schema";
import { hashPassword } from "./session";
import { cartpanda } from "../cartpanda/instance";

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: "Failed to create user. Email already in use. Please try again.",
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const cartpandaCustomersWithSameEmail = await cartpanda.getCustomers({
    email: email,
  });

  let customerId: string;

  if (cartpandaCustomersWithSameEmail.customers.length > 1) {
    console.error("Multiple customers found with the same email:", email);
    return {
      error:
        "Multiple customers found with the same email. Please contact support.",
      email,
      password,
    };
  } else if (cartpandaCustomersWithSameEmail.customers.length === 1) {
    customerId = cartpandaCustomersWithSameEmail.customers[0].id.toString();
  } else {
    const cartpandaCreatedCustomerResponse = await cartpanda.createCustomer({
      email,
      first_name: firstName,
      last_name: lastName,
    });
    customerId = cartpandaCreatedCustomerResponse.customer.id.toString();
  }

  const newUser: NewUser = {
    email,
    passwordHash,
    customerId,
  };

  const queryResult = await db.insert(users).values(newUser);

  if (queryResult[0].affectedRows === 0) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  return newUser;
}

export function generateRandomPassword(length: number): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
