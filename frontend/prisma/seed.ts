import { PrismaClient, Role, Category, OfferStatus, InterestStatus } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data in reverse dependency order to avoid foreign key issues
  await prisma.message.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.impactMetric.deleteMany();
  await prisma.user.deleteMany();

  // Create Business users
  const joesBakery = await prisma.user.create({
    data: {
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      role: Role.BUSINESS,
      name: "Joe's Bakery",
      description: "Family-owned bakery specializing in fresh bread, pastries, and cakes. We bake daily with locally sourced ingredients.",
      location: "Portland, OR",
      latitude: 45.5152,
      longitude: -122.6784,
      website: "https://joesbakery.example.com",
      phone: "(503) 555-0101",
      email: "contact@joesbakery.example.com",
      isVerified: true,
    },
  });

  const freshMart = await prisma.user.create({
    data: {
      address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
      role: Role.BUSINESS,
      name: "FreshMart Grocery",
      description: "Local grocery store committed to reducing food waste. We donate surplus produce and dairy weekly.",
      location: "Portland, OR",
      latitude: 45.5231,
      longitude: -122.6765,
      website: "https://freshmart.example.com",
      phone: "(503) 555-0202",
      email: "donations@freshmart.example.com",
      isVerified: true,
    },
  });

  // Create Institution users
  const portlandFoodBank = await prisma.user.create({
    data: {
      address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
      role: Role.INSTITUTION,
      name: "Portland Food Bank",
      description: "Serving the Portland community since 1984. We distribute food to over 100 partner agencies and meal sites.",
      location: "Portland, OR",
      latitude: 45.5301,
      longitude: -122.6601,
      website: "https://portlandfoodbank.example.org",
      phone: "(503) 555-0303",
      email: "info@portlandfoodbank.example.org",
      isVerified: true,
    },
  });

  const cityShelter = await prisma.user.create({
    data: {
      address: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
      role: Role.INSTITUTION,
      name: "City Shelter",
      description: "Emergency shelter and transitional housing provider. We serve 500+ meals daily to individuals and families in need.",
      location: "Portland, OR",
      latitude: 45.5089,
      longitude: -122.6905,
      website: "https://cityshelter.example.org",
      phone: "(503) 555-0404",
      email: "programs@cityshelter.example.org",
      isVerified: true,
    },
  });

  // Create Offers
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const threeDays = 3 * oneDay;
  const oneWeek = 7 * oneDay;

  const bakeryOffer = await prisma.offer.create({
    data: {
      creatorId: joesBakery.id,
      category: Category.BAKERY,
      title: "Assorted Day-Old Breads and Pastries",
      description: "Approximately 30 loaves of assorted bread (sourdough, whole wheat, baguette) and 50 mixed pastries (croissants, muffins, danishes). All baked yesterday and perfectly good for consumption or repurposing.",
      quantity: "80 items",
      pickupAddress: "123 Baker Street, Portland, OR 97205",
      latitude: 45.5152,
      longitude: -122.6784,
      expiresAt: new Date(now.getTime() + oneDay),
      status: OfferStatus.ACTIVE,
    },
  });

  const produceOffer = await prisma.offer.create({
    data: {
      creatorId: freshMart.id,
      category: Category.PRODUCE,
      title: "Surplus Fresh Vegetables",
      description: "Mixed crate of fresh vegetables including carrots, potatoes, onions, bell peppers, and leafy greens. Approximately 50 lbs total. Some items have minor cosmetic imperfections but are fully edible.",
      quantity: "50 lbs",
      pickupAddress: "456 Market Ave, Portland, OR 97209",
      latitude: 45.5231,
      longitude: -122.6765,
      expiresAt: new Date(now.getTime() + threeDays),
      status: OfferStatus.ACTIVE,
    },
  });

  const dairyOffer = await prisma.offer.create({
    data: {
      creatorId: freshMart.id,
      category: Category.DAIRY,
      title: "Milk and Yogurt Assortment",
      description: "15 gallons of 2% milk and 40 cups of Greek yogurt (various flavors). Best-by date is in 5 days. Refrigerated and properly stored.",
      quantity: "55 units",
      pickupAddress: "456 Market Ave, Portland, OR 97209",
      latitude: 45.5231,
      longitude: -122.6765,
      expiresAt: new Date(now.getTime() + oneWeek),
      status: OfferStatus.PENDING_FULFILLMENT,
    },
  });

  const mixedOffer = await prisma.offer.create({
    data: {
      creatorId: joesBakery.id,
      category: Category.MIXED,
      title: "Catering Leftovers - Mixed Items",
      description: "Leftovers from a corporate event: sandwiches, salads, fruit platters, and desserts. Enough to feed approximately 40 people. Must be picked up today.",
      quantity: "40 servings",
      pickupAddress: "123 Baker Street, Portland, OR 97205",
      latitude: 45.5152,
      longitude: -122.6784,
      expiresAt: new Date(now.getTime() + oneDay),
      status: OfferStatus.ACTIVE,
    },
  });

  // Create Interests
  await prisma.interest.create({
    data: {
      offerId: bakeryOffer.id,
      institutionId: portlandFoodBank.id,
      message: "We would love to distribute these baked goods to our partner meal sites tomorrow morning. We can pick up at 8 AM.",
      status: InterestStatus.ACCEPTED,
    },
  });

  await prisma.interest.create({
    data: {
      offerId: produceOffer.id,
      institutionId: cityShelter.id,
      message: "Our kitchen can use these vegetables for tonight's dinner service and tomorrow's meal prep. Available for pickup at 2 PM.",
      status: InterestStatus.PENDING,
    },
  });

  await prisma.interest.create({
    data: {
      offerId: dairyOffer.id,
      institutionId: portlandFoodBank.id,
      message: "Our dairy cooler has space and we distribute milk daily to families. Could pick up any weekday between 9 AM and 4 PM.",
      status: InterestStatus.PENDING,
    },
  });

  // Create Impact Metrics for users
  await prisma.impactMetric.create({
    data: {
      address: joesBakery.address,
      offersCreated: 2,
      offersFulfilled: 1,
      interestsAccepted: 0,
      foodDivertedKg: 45.5,
      co2SavedKg: 90.2,
    },
  });

  await prisma.impactMetric.create({
    data: {
      address: freshMart.address,
      offersCreated: 2,
      offersFulfilled: 0,
      interestsAccepted: 0,
      foodDivertedKg: 78.3,
      co2SavedKg: 156.1,
    },
  });

  await prisma.impactMetric.create({
    data: {
      address: portlandFoodBank.address,
      offersCreated: 0,
      offersFulfilled: 0,
      interestsAccepted: 1,
      foodDivertedKg: 25.2,
      co2SavedKg: 50.4,
    },
  });

  await prisma.impactMetric.create({
    data: {
      address: cityShelter.address,
      offersCreated: 0,
      offersFulfilled: 0,
      interestsAccepted: 0,
      foodDivertedKg: 0,
      co2SavedKg: 0,
    },
  });

  console.log("✅ Seed data created successfully!");
  console.log(`   Users: 4 (2 businesses, 2 institutions)`);
  console.log(`   Offers: 4`);
  console.log(`   Interests: 3`);
  console.log(`   Impact Metrics: 4`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
