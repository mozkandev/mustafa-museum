// scripts/seed.mjs — Wikipedia + Wikimedia Commons'tan veri çek
import pkg from "@prisma/client";
import fs from "fs";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const PERIODS = [
  { id: "medieval", name: "Medieval Art", startYear: 500, endYear: 1400, region: "Europe", query: "Medieval art" },
  { id: "renaissance", name: "Renaissance", startYear: 1400, endYear: 1600, region: "Italy/Europe", query: "Renaissance art" },
  { id: "baroque", name: "Baroque", startYear: 1600, endYear: 1750, region: "Europe", query: "Baroque painting" },
  { id: "rococo", name: "Rococo", startYear: 1700, endYear: 1780, region: "France/Europe", query: "Rococo art" },
  { id: "neoclassicism", name: "Neoclassicism", startYear: 1750, endYear: 1850, region: "Europe", query: "Neoclassicism painting" },
  { id: "romanticism", name: "Romanticism", startYear: 1800, endYear: 1850, region: "Europe", query: "Romanticism painting" },
  { id: "realism", name: "Realism", startYear: 1840, endYear: 1880, region: "France/Europe", query: "Realism painting" },
  { id: "impressionism", name: "Impressionism", startYear: 1860, endYear: 1890, region: "France", query: "Impressionism painting" },
  { id: "post-impressionism", name: "Post-Impressionism", startYear: 1880, endYear: 1910, region: "France/Europe", query: "Post-Impressionism painting" },
  { id: "expressionism", name: "Expressionism", startYear: 1905, endYear: 1925, region: "Germany/Europe", query: "Expressionism painting" },
  { id: "cubism", name: "Cubism", startYear: 1907, endYear: 1922, region: "France", query: "Cubism painting" },
  { id: "surrealism", name: "Surrealism", startYear: 1920, endYear: 1950, region: "Europe", query: "Surrealism painting" },
  { id: "abstract-expressionism", name: "Abstract Expressionism", startYear: 1940, endYear: 1960, region: "USA", query: "Abstract Expressionism painting" },
  { id: "pop-art", name: "Pop Art", startYear: 1955, endYear: 1970, region: "UK/USA", query: "Pop art painting" },
];

// Küratörlü sanatçı listesi — her dönemin en bilinen 4-6 sanatçısı
const ARTISTS_BY_PERIOD = {
  medieval: [
    { name: "Giotto di Bondone", birth: 1267, death: 1337, nat: "Italian" },
    { name: "Duccio di Buoninsegna", birth: 1255, death: 1319, nat: "Italian" },
    { name: "Jan van Eyck", birth: 1390, death: 1441, nat: "Flemish" },
  ],
  renaissance: [
    { name: "Leonardo da Vinci", birth: 1452, death: 1519, nat: "Italian" },
    { name: "Michelangelo Buonarroti", birth: 1475, death: 1564, nat: "Italian" },
    { name: "Raphael", birth: 1483, death: 1520, nat: "Italian" },
    { name: "Sandro Botticelli", birth: 1445, death: 1510, nat: "Italian" },
    { name: "Titian", birth: 1488, death: 1576, nat: "Italian" },
  ],
  baroque: [
    { name: "Caravaggio", birth: 1571, death: 1610, nat: "Italian" },
    { name: "Rembrandt van Rijn", birth: 1606, death: 1669, nat: "Dutch" },
    { name: "Diego Velázquez", birth: 1599, death: 1660, nat: "Spanish" },
    { name: "Peter Paul Rubens", birth: 1577, death: 1640, nat: "Flemish" },
    { name: "Johannes Vermeer", birth: 1632, death: 1675, nat: "Dutch" },
  ],
  rococo: [
    { name: "Jean-Antoine Watteau", birth: 1684, death: 1721, nat: "French" },
    { name: "François Boucher", birth: 1703, death: 1770, nat: "French" },
    { name: "Jean-Honoré Fragonard", birth: 1732, death: 1806, nat: "French" },
  ],
  neoclassicism: [
    { name: "Jacques-Louis David", birth: 1748, death: 1825, nat: "French" },
    { name: "Jean-Auguste-Dominique Ingres", birth: 1780, death: 1867, nat: "French" },
  ],
  romanticism: [
    { name: "Eugène Delacroix", birth: 1798, death: 1863, nat: "French" },
    { name: "Caspar David Friedrich", birth: 1774, death: 1840, nat: "German" },
    { name: "J.M.W. Turner", birth: 1775, death: 1851, nat: "British" },
    { name: "Théodore Géricault", birth: 1791, death: 1824, nat: "French" },
  ],
  realism: [
    { name: "Gustave Courbet", birth: 1819, death: 1877, nat: "French" },
    { name: "Jean-François Millet", birth: 1814, death: 1875, nat: "French" },
  ],
  impressionism: [
    { name: "Claude Monet", birth: 1840, death: 1926, nat: "French" },
    { name: "Edgar Degas", birth: 1834, death: 1917, nat: "French" },
    { name: "Pierre-Auguste Renoir", birth: 1841, death: 1919, nat: "French" },
    { name: "Édouard Manet", birth: 1832, death: 1883, nat: "French" },
    { name: "Camille Pissarro", birth: 1830, death: 1903, nat: "French" },
  ],
  "post-impressionism": [
    { name: "Vincent van Gogh", birth: 1853, death: 1890, nat: "Dutch" },
    { name: "Paul Cézanne", birth: 1839, death: 1906, nat: "French" },
    { name: "Paul Gauguin", birth: 1848, death: 1903, nat: "French" },
    { name: "Georges Seurat", birth: 1859, death: 1891, nat: "French" },
  ],
  expressionism: [
    { name: "Edvard Munch", birth: 1863, death: 1944, nat: "Norwegian" },
    { name: "Wassily Kandinsky", birth: 1866, death: 1944, nat: "Russian" },
    { name: "Ernst Ludwig Kirchner", birth: 1880, death: 1938, nat: "German" },
  ],
  cubism: [
    { name: "Pablo Picasso", birth: 1881, death: 1973, nat: "Spanish" },
    { name: "Georges Braque", birth: 1882, death: 1963, nat: "French" },
    { name: "Juan Gris", birth: 1887, death: 1927, nat: "Spanish" },
  ],
  surrealism: [
    { name: "Salvador Dalí", birth: 1904, death: 1989, nat: "Spanish" },
    { name: "René Magritte", birth: 1898, death: 1967, nat: "Belgian" },
    { name: "Max Ernst", birth: 1891, death: 1976, nat: "German" },
  ],
  "abstract-expressionism": [
    { name: "Jackson Pollock", birth: 1912, death: 1956, nat: "American" },
    { name: "Mark Rothko", birth: 1903, death: 1970, nat: "American" },
    { name: "Willem de Kooning", birth: 1904, death: 1997, nat: "American" },
  ],
  "pop-art": [
    { name: "Andy Warhol", birth: 1928, death: 1987, nat: "American" },
    { name: "Roy Lichtenstein", birth: 1923, death: 1997, nat: "American" },
  ],
};

async function fetchSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "MustafaMuseum/1.0" } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function fetchImagesForArtist(artistName, limit = 6) {
  // Wikimedia Commons'da sanatçının kategorisinden görseller çek
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(artistName + " painting")}&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600`;
  try {
    const r = await fetch(searchUrl, { headers: { "User-Agent": "MustafaMuseum/1.0" } });
    if (!r.ok) return [];
    const data = await r.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    return pages
      .filter(p => p.imageinfo?.[0]?.url && p.imageinfo[0].mime?.startsWith("image/"))
      .map(p => ({
        title: p.title.replace(/^File:/, "").replace(/\.\w+$/, ""),
        imageUrl: p.imageinfo[0].url,
        thumbUrl: p.imageinfo[0].thumburl || p.imageinfo[0].url,
        width: p.imageinfo[0].width,
        height: p.imageinfo[0].height,
      }));
  } catch { return []; }
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("Seeding periods + artists + works from Wikipedia…");
  for (const p of PERIODS) {
    const summary = await fetchSummary(p.query);
    await prisma.period.upsert({
      where: { id: p.id },
      update: { name: p.name, startYear: p.startYear, endYear: p.endYear, region: p.region, summary: summary?.extract || `${p.name} (${p.startYear}–${p.endYear})` },
      create: { id: p.id, name: p.name, startYear: p.startYear, endYear: p.endYear, region: p.region, summary: summary?.extract || `${p.name} (${p.startYear}–${p.endYear})` },
    });
    console.log(`✓ Period: ${p.name}`);

    const artists = ARTISTS_BY_PERIOD[p.id] || [];
    for (const a of artists) {
      const artistId = slugify(a.name);
      const s = await fetchSummary(a.name);
      await prisma.artist.upsert({
        where: { id: artistId },
        update: { name: a.name, birthYear: a.birth, deathYear: a.death, periodId: p.id, nationality: a.nat, summary: s?.extract || "", movements: p.name, portrait: s?.thumbnail?.source || null },
        create: { id: artistId, name: a.name, birthYear: a.birth, deathYear: a.death, periodId: p.id, nationality: a.nat, summary: s?.extract || "", movements: p.name, portrait: s?.thumbnail?.source || null },
      });
      console.log(`  ✓ Artist: ${a.name}`);

      // Skip images if already seeded (fast re-runs)
      const existing = await prisma.work.count({ where: { artistId } });
      if (existing > 0) {
        console.log(`    (skip — ${existing} works already)`);
        continue;
      }

      const images = await fetchImagesForArtist(a.name, 6);
      let i = 0;
      for (const img of images) {
        const workId = `${artistId}-${slugify(img.title)}-${i++}`;
        const aspect = img.width && img.height ? img.width / img.height : 1.5;
        await prisma.work.create({
          data: {
            id: workId,
            title: img.title.replace(/_/g, " "),
            artistId,
            year: a.birth + (i * 5),
            imageUrl: img.imageUrl,
            thumbUrl: img.thumbUrl,
            medium: "Oil on canvas",
            style: p.name,
            width: img.width,
            height: img.height,
            description: `From Wikimedia Commons: ${img.title}`,
          },
        });
      }
      console.log(`    + ${images.length} works`);
      await new Promise(r => setTimeout(r, 200)); // rate limit
    }
  }
  const counts = {
    periods: await prisma.period.count(),
    artists: await prisma.artist.count(),
    works: await prisma.work.count(),
  };
  console.log("\nDONE:", counts);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
