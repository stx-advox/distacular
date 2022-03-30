import fetch from "cross-fetch";

export const getBNSName = async (address: string) => {
  const res = await fetch(
    `${process.env.STACKS_URL}/v1/addresses/stacks/${address}`
  );

  const data = await res.json();

  const firstName = data?.names[0];
  return firstName || address;
};
