import { prisma, UserCreateInput } from "../prisma-client/index";

export const isUserExists = async (battletag: string) =>
  await prisma.$exists.user({ battletag });

export const registerUser = async (user: UserCreateInput) =>
  await prisma.createUser(user);

export const getUserById = async (battletag: string) =>
  await prisma.user({ battletag });
