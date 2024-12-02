import prisma from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  // Decode the URL-encoded search term (this handles %20 and other encoded characters)
  const searchTerm = decodeURIComponent(event.context.params.id.trim());

  console.log("Search Running!");
  console.log("Decoded search term:", searchTerm);

  // If the search term is empty, return an empty array
  if (!searchTerm) {
    return [];
  }

  // Perform the Prisma query with the decoded search term
  let items = await prisma.products.findMany({
    take: 5, // Max rows
    where: {
      title: {
        contains: searchTerm, // Use the decoded search term
        mode: "insensitive", // Case insensitive search
      },
    },
  });

  return items;
});
