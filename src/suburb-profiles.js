import { AREA_GROUPS } from "./contact-options.js";
import { SERVICE_CATALOG } from "./service-catalog.js";

export function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[’']/g, "-")
    .replace(/&/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

const featuredServiceSlugs = ["roof-leak-repairs", "roof-inspections", "roof-cleaning"];
export const DISTRICT_PROFILES = Object.freeze(AREA_GROUPS.map(({ district, suburbs }) => {
  const path = `/areas/${slugify(district)}`;
  return Object.freeze({
    district,
    suburbs,
    path,
    title: `${district} Roof Repair Services | Ellis Services Group`,
    description: `Roof repair services across ${district}, Canberra: roof leak repairs, tile and metal roof repairs, roof renovation, cleaning and gutter maintenance.`,
    canonical: `https://www.canberraroofkind.com.au${path}`,
    h1: `${district} Roof Repair Services`,
    servicePaths: SERVICE_CATALOG.map(({ path: servicePath }) => servicePath),
  });
}));

export const SUBURB_PROFILES = Object.freeze(AREA_GROUPS.flatMap(({ district, suburbs }) => suburbs.map((suburb) => {
  const path = `/areas/${slugify(district)}/${slugify(suburb)}-roof-repairs`;
  return Object.freeze({
    suburb, district, path, slug: `${slugify(district)}/${slugify(suburb)}-roof-repairs`,
    areaOption: `${suburb} — ${district}`,
    title: `Roof Repairs ${suburb}, ${district} | Ellis Services Group`,
    description: `Roof repairs in ${suburb}, ${district}: compare repair, renovation, roof cleaning and gutter or downpipe maintenance enquiry pathways with Ellis Services Group.`,
    canonical: `https://www.canberraroofkind.com.au${path}`,
    h1: `Roof Repairs in ${suburb}, ${district}`,
    featuredServiceSlugs,
    servicePaths: SERVICE_CATALOG.map(({ path: servicePath }) => servicePath),
  });
})));

export const SUBURB_PATHS = Object.freeze(SUBURB_PROFILES.map(({ path }) => path));
export const DISTRICT_PATHS = Object.freeze(DISTRICT_PROFILES.map(({ path }) => path));
const byPath = new Map(SUBURB_PROFILES.map((profile) => [profile.path, profile]));
const districtByPath = new Map(DISTRICT_PROFILES.map((profile) => [profile.path, profile]));
const byArea = new Map(SUBURB_PROFILES.map((profile) => [`${profile.suburb}\u0000${profile.district}`, profile.path]));
if (byPath.size !== SUBURB_PROFILES.length) throw new Error("Suburb route collision");

export function getSuburbProfile(pathname) { return byPath.get(pathname) ?? null; }
export function getDistrictProfile(pathname) { return districtByPath.get(pathname) ?? null; }
export function getSuburbRoute(suburb, district) { return byArea.get(`${suburb}\u0000${district}`) ?? null; }
