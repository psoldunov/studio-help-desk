"use server";

import auth from "..";

export const signInWithEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) =>
  await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: `/test`,
    },
    asResponse: true,
  });

export const signUpWithEmail = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) =>
  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: `/test`,
    },
    asResponse: true,
  });
