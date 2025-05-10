import { db } from "../db/drizzle";
import { NewUser, users } from "../db/schema";
import { cartpanda } from "../cartpanda/instance";

export async function createCustomerInDB(email: string) {
  try {
    const customersWithSameEmail = await cartpanda.getCustomers({
      email: email,
    });

    if (customersWithSameEmail.customers.length > 1) {
      console.error("Múltiplos clientes encontrados com o mesmo e-mail:", email);
      return {
        error:
          "Múltiplos clientes encontrados com o mesmo e-mail. Por favor, entre em contato com o suporte.",
        email,
      };
    } else if (customersWithSameEmail.customers.length === 0) {
      return {
        error: "Nenhum cliente encontrado com o e-mail fornecido no Cartpanda.",
        email,
      };
    }

    const customer = customersWithSameEmail.customers[0];
    const customerId = customer.id.toString();
    const userName =
      customer.first_name && customer.last_name
        ? `${customer.first_name} ${customer.last_name}`
        : null;

    const newUser: NewUser = {
      email,
      customerId,
      name: userName,
    };

    const queryResult = await db.insert(users).values(newUser);

    if (queryResult[0].affectedRows === 0) {
      console.error("Falha ao criar usuário no banco de dados:", newUser);
      return {
        error: "Falha ao criar usuário. Por favor, tente novamente.",
        email,
      };
    }

    return newUser;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return {
      error: "Ocorreu um erro inesperado ao criar o usuário.",
      email,
    };
  }
}
