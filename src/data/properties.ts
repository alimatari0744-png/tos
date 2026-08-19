import {
  type Desire,
  type Usage,
  type PropertyStatus,
  type Bilingual,
  type Lang,
  getCity,
  getProductType,
  getRegionByCity,
} from "./catalog";

export type { PropertyStatus };

export interface Property {
  id: string;
  ref: string;
  desire: Desire;
  usage: Usage;
  typeId: string;
  cityId: string;
  districtId: string;
  area: number;
  price: number;
  status: PropertyStatus;
  image: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  livingRooms?: number;
  age?: number;
  street?: number;
  streetWest?: number;
  license?: string;
  description?: Bilingual;
  lat?: number;
  lng?: number;
}

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const SHOTS: Record<string, string> = {
  "villa-01": "photo-1613490493576-7fde63acd811",
  "villa-02": "photo-1600596542815-ffad4c1539a9",
  "villa-03": "photo-1600585154340-be6161a56a0c",
  "villa-04": "photo-1564013799919-ab600027ffc6",
  "villa-05": "photo-1600047509807-ba8f99d2cdbc",
  "villa-06": "photo-1512917774080-9991f1c4c750",
  "villa-07": "photo-1600607687644-c7171b42498b",
  "villa-09": "photo-1600566753086-00f18fb6b3ea",
  "villa-10": "photo-1613977257363-707ba564dd11",
  "apt-01": "photo-1522708323590-d24e7bb74047",
  "apt-02": "photo-1502672260266-1c1ef2d93688",
  "apt-03": "photo-1493809842364-82806fdbf227",
  "apt-04": "photo-1505691938895-1758d7afbd2d",
  "apt-05": "photo-1560448204-e02f11e3a0d2",
  "apt-09": "photo-1600210492486-724fe5c67fb0",
  "bldg-01": "photo-1545324418-cc1a3fa10c00",
  "bldg-02": "photo-1486406146926-c627a92ad1ab",
  "bldg-03": "photo-1486325212027-8081e485255e",
  "bldg-04": "photo-1497366216548-37526070297c",
  "land-01": "photo-1500382017468-9049fed747ef",
  "land-02": "photo-1469474968028-56623f02e42e",
  "land-03": "photo-1441974231531-c6227db76b6e",
  "land-04": "photo-1472214103451-9374bd1c798e",
  "office-01": "photo-1497366811353-6870744d04b2",
  "office-02": "photo-1524758631624-e2822e304c36",
  "office-03": "photo-1497215728101-856f4ea42174",
  "shop-01": "photo-1441986300917-64674bd600d8",
  "shop-02": "photo-1604719312566-8912e9227c6a",
  "farm-01": "photo-1464226184884-fa280b87cba5",
  "farm-02": "photo-1500534314209-a25ddb2bd429",
  "palace-01": "photo-1605276374104-dee2a0ed3cd6",
  "palace-02": "photo-1600585152220-90363fe30d40",
  "wh-02": "photo-1586528116311-ad8dd3d8d0e0",
};

const photo = (name: string) => U(SHOTS[name] ?? "photo-1613490493576-7fde63acd811");

export const DEMO_GALLERY = [
  photo("villa-01"),
  photo("villa-02"),
  photo("villa-03"),
  photo("apt-01"),
  photo("apt-02"),
  photo("bldg-01"),
  photo("land-01"),
  photo("office-01"),
];

const GEO: Record<string, [number, number]> = {
  riyadh: [24.7136, 46.6753],
  kharj: [24.1556, 47.335],
  jeddah: [21.4858, 39.1925],
  taif: [21.2854, 40.4183],
  dammam: [26.4207, 50.0888],
  khobar: [26.2172, 50.1971],
};

function pin(cityId: string, dLat: number, dLng: number) {
  const [lat, lng] = GEO[cityId] ?? GEO.riyadh;
  return { lat: +(lat + dLat).toFixed(5), lng: +(lng + dLng).toFixed(5) };
}

function shots(names: string[]): { image: string; images: string[] } {
  const images = names.map(photo);
  return { image: images[0], images };
}

function desc(ar: string, en: string): Bilingual {
  return { ar, en };
}

export const properties: Property[] = [
  {
    id: "demo-01",
    ref: "9050934",
    desire: "sale",
    usage: "residential",
    typeId: "villa",
    cityId: "riyadh",
    districtId: "sulimaniyah",
    area: 1720,
    price: 9625000,
    status: "available",
    ...shots(["villa-01", "villa-02", "apt-05", "villa-06"]),
    bedrooms: 6,
    bathrooms: 7,
    livingRooms: 3,
    age: 1,
    street: 20,
    streetWest: 15,
    ...pin("riyadh", 0.012, -0.008),
    description: desc(
      "فيلا فاخرة للبيع في حي السليمانية بالرياض، بواجهة حجر وحديقة واسعة ومسبح خاص. مناسبة للسكن العائلي الراقي أو الاستثمار طويل الأمد.",
      "Luxury villa for sale in Al Sulimaniyah, Riyadh, with a stone facade, large garden and private pool. Ideal for upscale family living or long-term investment.",
    ),
  },
  {
    id: "demo-02",
    ref: "7082296",
    desire: "sale",
    usage: "residential",
    typeId: "residential-land",
    cityId: "riyadh",
    districtId: "rimal",
    area: 17464,
    price: 78588000,
    status: "sold",
    ...shots(["land-01", "land-02", "land-04", "bldg-01"]),
    street: 30,
    ...pin("riyadh", 0.04, 0.055),
    description: desc(
      "أرض سكنية كبيرة للبيع في حي الرمال، موقع استراتيجي على شارع 30 متر. النموذج يوضح حالة «تم البيع» داخل المنصة.",
      "Large residential plot for sale in Al Rimal on a 30m street. This sample shows the sold status inside the platform.",
    ),
  },
  {
    id: "demo-03",
    ref: "7561563",
    desire: "sale",
    usage: "commercial",
    typeId: "commercial-land",
    cityId: "riyadh",
    districtId: "malqa",
    area: 34836,
    price: 59222050,
    status: "available",
    ...shots(["land-02", "land-04", "bldg-02", "land-01"]),
    street: 36,
    ...pin("riyadh", 0.062, -0.03),
    description: desc(
      "أرض تجارية للبيع في حي الملقا بمساحة استثمارية كبيرة على شارعين، مناسبة لإقامة مجمع تجاري أو أبراج مكتبية.",
      "Commercial land for sale in Al Malqa with a large investment area on two streets, suitable for a mall or office towers.",
    ),
  },
  {
    id: "demo-04",
    ref: "5208456",
    desire: "rent",
    usage: "residential",
    typeId: "apartment",
    cityId: "riyadh",
    districtId: "rimal",
    area: 168,
    price: 55000,
    status: "available",
    ...shots(["apt-01", "apt-02", "apt-03", "apt-05"]),
    bedrooms: 3,
    bathrooms: 2,
    livingRooms: 1,
    age: 2,
    street: 15,
    ...pin("riyadh", 0.038, 0.048),
    description: desc(
      "شقة للإيجار السنوي في حي الرمال: 3 غرف وصالة وتشطيب حديث، قريبة من المدارس والخدمات.",
      "Apartment for annual rent in Al Rimal: 3 bedrooms, a living room and modern finishing, close to schools and services.",
    ),
  },
  {
    id: "demo-05",
    ref: "4807763",
    desire: "sale",
    usage: "residential",
    typeId: "villa",
    cityId: "riyadh",
    districtId: "narjis",
    area: 560,
    price: 5500000,
    status: "available",
    ...shots(["villa-02", "villa-03", "apt-09", "villa-05"]),
    bedrooms: 5,
    bathrooms: 6,
    livingRooms: 2,
    age: 0,
    street: 18,
    streetWest: 12,
    ...pin("riyadh", 0.07, 0.01),
    description: desc(
      "فيلا جديدة للبيع في حي النرجس، تشطيب فاخر ومواقف داخلية وحديقة أمامية. جاهزة للسكن مباشرة.",
      "Brand-new villa for sale in Al Narjis with luxury finishing, indoor parking and a front garden. Move-in ready.",
    ),
  },
  {
    id: "demo-06",
    ref: "5144521",
    desire: "sale",
    usage: "residential",
    typeId: "duplex",
    cityId: "jeddah",
    districtId: "rawdah",
    area: 298,
    price: 3200000,
    status: "available",
    ...shots(["villa-03", "villa-09", "apt-01", "apt-04"]),
    bedrooms: 4,
    bathrooms: 4,
    livingRooms: 2,
    age: 3,
    street: 16,
    ...pin("jeddah", 0.018, 0.012),
    description: desc(
      "دبلكس للبيع في حي الروضة بجدة، تصميم عصري وطابقين مستقلين مناسب لعائلتين أو للاستثمار بالتقسيم.",
      "Duplex for sale in Al Rawdah, Jeddah, with a modern design and two independent floors for two families or split investment.",
    ),
  },
  {
    id: "demo-07",
    ref: "7458753",
    desire: "sale",
    usage: "residential",
    typeId: "villa",
    cityId: "jeddah",
    districtId: "shati",
    area: 1717,
    price: 10302000,
    status: "available",
    ...shots(["villa-04", "villa-06", "villa-07", "palace-01"]),
    bedrooms: 7,
    bathrooms: 8,
    livingRooms: 3,
    age: 1,
    street: 25,
    ...pin("jeddah", 0.03, -0.02),
    description: desc(
      "فيلا مطلّة قرب الشاطئ في جدة للبيع، مساحات واسعة ومجلس رجال منفصل وإطلالة مفتوحة.",
      "Sea-adjacent villa for sale in Jeddah with generous spaces, a private majlis and an open view.",
    ),
  },
  {
    id: "demo-08",
    ref: "8335869",
    desire: "rent",
    usage: "residential",
    typeId: "tower-apartment",
    cityId: "jeddah",
    districtId: "hamra",
    area: 475,
    price: 120000,
    status: "available",
    ...shots(["apt-04", "bldg-01", "apt-05", "apt-02"]),
    bedrooms: 4,
    bathrooms: 4,
    livingRooms: 1,
    age: 2,
    street: 20,
    ...pin("jeddah", 0.01, 0.008),
    description: desc(
      "شقة في برج للإيجار بحي الحمراء، إطلالة بحرية وخدمات فندقية ومواقف مخصصة.",
      "Tower apartment for rent in Al Hamra with a sea view, hotel-style amenities and reserved parking.",
    ),
  },
  {
    id: "demo-09",
    ref: "1544148",
    desire: "sale",
    usage: "agricultural",
    typeId: "farm",
    cityId: "kharj",
    districtId: "kharj-nahda",
    area: 10000,
    price: 6000000,
    status: "available",
    ...shots(["farm-02", "farm-01", "land-01", "land-04"]),
    street: 12,
    ...pin("kharj", 0.01, -0.015),
    description: desc(
      "مزرعة للبيع في الخرج مع آبار ومنطقة استراحة ومساحات زراعية جاهزة للإنتاج.",
      "Farm for sale in Al Kharj with wells, a rest area and agricultural plots ready for production.",
    ),
  },
  {
    id: "demo-10",
    ref: "2274891",
    desire: "rent",
    usage: "commercial",
    typeId: "office",
    cityId: "dammam",
    districtId: "faisaliyah",
    area: 220,
    price: 90000,
    status: "available",
    ...shots(["office-01", "office-02", "office-03", "bldg-02"]),
    bathrooms: 2,
    street: 30,
    ...pin("dammam", 0.008, 0.006),
    description: desc(
      "مكتب للإيجار في حي الفيصلية بالدمام، تشطيب إداري حديث وقاعة اجتماعات ومدخل مستقل.",
      "Office for rent in Al Faisaliyah, Dammam, with modern corporate finishing, a meeting room and a private entrance.",
    ),
  },
  {
    id: "demo-11",
    ref: "3398120",
    desire: "sale",
    usage: "commercial",
    typeId: "building",
    cityId: "khobar",
    districtId: "olaya",
    area: 640,
    price: 7800000,
    status: "available",
    ...shots(["bldg-01", "bldg-04", "bldg-02", "apt-03"]),
    age: 4,
    street: 24,
    ...pin("khobar", 0.006, -0.004),
    description: desc(
      "عمارة تجارية للبيع في العليا بالخبر، عوائد إيجارية قائمة ومحلات في الدور الأرضي.",
      "Commercial building for sale in Al Olaya, Khobar, with existing rental income and ground-floor shops.",
    ),
  },
  {
    id: "demo-12",
    ref: "6611204",
    desire: "sale",
    usage: "residential",
    typeId: "villa",
    cityId: "taif",
    districtId: "shafa",
    area: 520,
    price: 2900000,
    status: "available",
    ...shots(["villa-05", "villa-09", "villa-10", "apt-09"]),
    bedrooms: 5,
    bathrooms: 5,
    livingRooms: 2,
    age: 2,
    street: 15,
    ...pin("taif", 0.02, -0.01),
    description: desc(
      "فيلا للبيع في الشفا بالطائف، جو معتدل وحديقة كبيرة وإطلالة جبلية.",
      "Villa for sale in Al Shafa, Taif, with a mild climate, large garden and mountain views.",
    ),
  },
  {
    id: "demo-13",
    ref: "9921455",
    desire: "rent",
    usage: "industrial",
    typeId: "warehouse",
    cityId: "dammam",
    districtId: "shulah",
    area: 1200,
    price: 180000,
    status: "available",
    ...shots(["wh-02", "land-02", "bldg-04", "office-03"]),
    street: 40,
    ...pin("dammam", -0.02, 0.018),
    description: desc(
      "مستودع للإيجار في الشعلة بالدمام على شارع 40 متر، ارتفاع مناسب للرفوف ومكتب إداري ملحق.",
      "Warehouse for rent in Al Shulah, Dammam on a 40m street, with rack-friendly height and an attached office.",
    ),
  },
  {
    id: "demo-14",
    ref: "4455012",
    desire: "sale",
    usage: "residential",
    typeId: "apartment",
    cityId: "khobar",
    districtId: "rakah",
    area: 190,
    price: 980000,
    status: "available",
    ...shots(["apt-02", "apt-03", "apt-05", "apt-01"]),
    bedrooms: 3,
    bathrooms: 2,
    livingRooms: 1,
    age: 5,
    street: 15,
    ...pin("khobar", 0.012, 0.01),
    description: desc(
      "شقة للبيع في الراكة بالخبر، قريبة من الكورنيش ومناسبة للسكن أو الشراء بهدف التأجير.",
      "Apartment for sale in Al Rakah, Khobar, close to the corniche and suitable for living or buy-to-let.",
    ),
  },
  {
    id: "demo-15",
    ref: "8123401",
    desire: "sale",
    usage: "residential",
    typeId: "palace",
    cityId: "riyadh",
    districtId: "malqa",
    area: 2850,
    price: 18500000,
    status: "available",
    ...shots(["palace-01", "palace-02", "villa-04", "villa-07"]),
    bedrooms: 10,
    bathrooms: 12,
    livingRooms: 4,
    age: 2,
    street: 30,
    streetWest: 20,
    ...pin("riyadh", 0.055, -0.022),
    description: desc(
      "قصر للبيع في الملقا بمجالس واسعة، جناح ضيافة، مسبح وحديقة مسورة. نموذج فاخر يوضح عروض النخبة.",
      "Palace for sale in Al Malqa with large majlis halls, a guest wing, a pool and a walled garden. A luxury sample of premium listings.",
    ),
  },
  {
    id: "demo-16",
    ref: "6120988",
    desire: "sale",
    usage: "residential",
    typeId: "floor",
    cityId: "riyadh",
    districtId: "yasmin",
    area: 320,
    price: 1750000,
    status: "available",
    ...shots(["apt-03", "apt-09", "villa-10", "apt-04"]),
    bedrooms: 4,
    bathrooms: 3,
    livingRooms: 1,
    age: 1,
    street: 18,
    ...pin("riyadh", 0.08, 0.004),
    description: desc(
      "دور كامل للبيع في حي الياسمين، مدخل مستقل وسطح خاص وموقفين.",
      "Full floor for sale in Al Yasmin with a private entrance, a private rooftop and two parking spaces.",
    ),
  },
  {
    id: "demo-17",
    ref: "3902214",
    desire: "rent",
    usage: "residential",
    typeId: "villa",
    cityId: "jeddah",
    districtId: "shati",
    area: 640,
    price: 220000,
    status: "available",
    ...shots(["villa-06", "villa-07", "villa-01", "apt-05"]),
    bedrooms: 5,
    bathrooms: 6,
    livingRooms: 2,
    age: 4,
    street: 20,
    ...pin("jeddah", 0.026, -0.016),
    description: desc(
      "فيلا للإيجار السنوي قرب الشاطئ بجدة، مؤثثة جزئياً ومناسبة للعائلات التنفيذية.",
      "Villa for annual rent near the Jeddah waterfront, partly furnished and suitable for executive families.",
    ),
  },
  {
    id: "demo-18",
    ref: "2288110",
    desire: "rent",
    usage: "residential",
    typeId: "floor",
    cityId: "riyadh",
    districtId: "sulimaniyah",
    area: 240,
    price: 70000,
    status: "available",
    ...shots(["apt-09", "apt-01", "apt-02", "villa-09"]),
    bedrooms: 3,
    bathrooms: 3,
    livingRooms: 1,
    age: 6,
    street: 15,
    ...pin("riyadh", 0.009, -0.006),
    description: desc(
      "دور للإيجار في السليمانية، تشطيب نظيف وقريب من طريق الملك فهد.",
      "Floor for rent in Al Sulimaniyah with clean finishing and proximity to King Fahd Road.",
    ),
  },
  {
    id: "demo-19",
    ref: "7712033",
    desire: "sale",
    usage: "commercial",
    typeId: "showroom",
    cityId: "jeddah",
    districtId: "hamra",
    area: 480,
    price: 4200000,
    status: "available",
    ...shots(["shop-01", "shop-02", "bldg-02", "office-01"]),
    street: 40,
    ...pin("jeddah", 0.004, 0.014),
    description: desc(
      "معرض للبيع على شارع تجاري في الحمراء، واجهة زجاجية ومواقف أمامية.",
      "Showroom for sale on a commercial street in Al Hamra, with a glass frontage and front parking.",
    ),
  },
  {
    id: "demo-20",
    ref: "5591002",
    desire: "sale",
    usage: "commercial",
    typeId: "shop",
    cityId: "jeddah",
    districtId: "rawdah",
    area: 85,
    price: 1450000,
    status: "available",
    ...shots(["shop-02", "shop-01", "bldg-01", "office-02"]),
    street: 25,
    ...pin("jeddah", 0.016, 0.01),
    description: desc(
      "محل للبيع في موقع حيوي بالروضة، مناسب للتجزئة أو المطاعم.",
      "Shop for sale in a busy Al Rawdah location, suitable for retail or F&B.",
    ),
  },
  {
    id: "demo-21",
    ref: "4401987",
    desire: "rent",
    usage: "commercial",
    typeId: "shop",
    cityId: "khobar",
    districtId: "olaya",
    area: 70,
    price: 85000,
    status: "available",
    ...shots(["shop-01", "bldg-04", "shop-02", "office-03"]),
    street: 20,
    ...pin("khobar", 0.003, -0.007),
    description: desc(
      "محل للإيجار في العليا بالخبر داخل حركة تجارية عالية، مناسب للشراء التشغيلي أو التأجير من الباطن حسب الاتفاق.",
      "Shop for rent in Al Olaya, Khobar in a high-traffic area, suitable for operators or agreed subletting.",
    ),
  },
  {
    id: "demo-22",
    ref: "3188004",
    desire: "rent",
    usage: "commercial",
    typeId: "office",
    cityId: "riyadh",
    districtId: "sulimaniyah",
    area: 160,
    price: 110000,
    status: "available",
    ...shots(["office-02", "office-01", "bldg-02", "office-03"]),
    bathrooms: 2,
    street: 36,
    ...pin("riyadh", 0.014, -0.011),
    description: desc(
      "مكتب للإيجار في السليمانية بتشطيب مفتوح ومناطق عمل جاهزة للشركات الناشئة.",
      "Office for rent in Al Sulimaniyah with an open layout and ready work zones for growing companies.",
    ),
  },
  {
    id: "demo-23",
    ref: "9033441",
    desire: "sale",
    usage: "industrial",
    typeId: "industrial-land",
    cityId: "dammam",
    districtId: "shulah",
    area: 5000,
    price: 4500000,
    status: "available",
    ...shots(["land-04", "wh-02", "land-02", "land-01"]),
    street: 36,
    ...pin("dammam", -0.028, 0.022),
    description: desc(
      "أرض صناعية للبيع في الشعلة، خدمات مكتملة ومناسبة لإنشاء مستودعات أو ورش.",
      "Industrial land for sale in Al Shulah with completed utilities, suitable for warehouses or workshops.",
    ),
  },
  {
    id: "demo-24",
    ref: "6677012",
    desire: "sale",
    usage: "industrial",
    typeId: "factory",
    cityId: "dammam",
    districtId: "shulah",
    area: 3200,
    price: 8900000,
    status: "available",
    ...shots(["wh-02", "land-02", "office-03", "bldg-04"]),
    age: 8,
    street: 40,
    ...pin("dammam", -0.024, 0.03),
    description: desc(
      "مصنع للبيع مع هنجر إنتاج ومكاتب إدارية وغرفة كهرباء مستقلة.",
      "Factory for sale with a production hangar, admin offices and a dedicated electrical room.",
    ),
  },
  {
    id: "demo-25",
    ref: "2108876",
    desire: "rent",
    usage: "industrial",
    typeId: "factory",
    cityId: "dammam",
    districtId: "faisaliyah",
    area: 1800,
    price: 260000,
    status: "available",
    ...shots(["wh-02", "office-01", "land-04", "bldg-02"]),
    age: 10,
    street: 30,
    ...pin("dammam", 0.012, 0.016),
    description: desc(
      "مصنع للإيجار في الفيصلية بمساحة إنتاج مرنة ومواقف شاحنات.",
      "Factory for rent in Al Faisaliyah with a flexible production floor and truck parking.",
    ),
  },
  {
    id: "demo-26",
    ref: "5544330",
    desire: "sale",
    usage: "agricultural",
    typeId: "agricultural-land",
    cityId: "kharj",
    districtId: "kharj-north",
    area: 25000,
    price: 3750000,
    status: "available",
    ...shots(["land-01", "farm-01", "land-04", "farm-02"]),
    street: 15,
    ...pin("kharj", -0.012, 0.02),
    description: desc(
      "أرض زراعية للبيع شمال الخرج، تربة جيدة وفرصة للاستصلاح أو الاستثمار.",
      "Agricultural land for sale north of Al Kharj with good soil, suitable for cultivation or investment.",
    ),
  },
  {
    id: "demo-27",
    ref: "7781290",
    desire: "sale",
    usage: "agricultural",
    typeId: "rest-house",
    cityId: "taif",
    districtId: "shafa",
    area: 900,
    price: 1650000,
    status: "available",
    ...shots(["villa-10", "farm-02", "villa-05", "land-03"]),
    bedrooms: 4,
    bathrooms: 4,
    livingRooms: 2,
    age: 5,
    street: 12,
    ...pin("taif", 0.028, -0.018),
    description: desc(
      "استراحة للبيع في الشفا، جلسات خارجية ومشبات ومساحات خضراء للعطل العائلية.",
      "Rest house for sale in Al Shafa with outdoor seating, fireplaces and greenery for family holidays.",
    ),
  },
  {
    id: "demo-28",
    ref: "3344551",
    desire: "rent",
    usage: "agricultural",
    typeId: "rest-house",
    cityId: "taif",
    districtId: "hawiyah",
    area: 700,
    price: 80000,
    status: "available",
    ...shots(["villa-09", "farm-01", "villa-03", "land-03"]),
    bedrooms: 3,
    bathrooms: 3,
    livingRooms: 1,
    age: 7,
    street: 10,
    ...pin("taif", -0.015, 0.02),
    description: desc(
      "استراحة للإيجار في الحوية بالطائف، مناسبة للمسارات الموسمية والعزائم.",
      "Rest house for rent in Al Hawiyah, Taif, suitable for seasonal stays and gatherings.",
    ),
  },
  {
    id: "demo-29",
    ref: "9011223",
    desire: "sale",
    usage: "health",
    typeId: "clinic",
    cityId: "riyadh",
    districtId: "yasmin",
    area: 420,
    price: 3100000,
    status: "available",
    ...shots(["office-03", "bldg-01", "office-01", "apt-02"]),
    bathrooms: 4,
    street: 20,
    ...pin("riyadh", 0.076, 0.012),
    description: desc(
      "مجمع طبي للبيع في الياسمين، تقسيم عيادات جاهز ومصعد ومواقف للمرضى.",
      "Medical complex for sale in Al Yasmin with ready clinic rooms, an elevator and patient parking.",
    ),
  },
  {
    id: "demo-30",
    ref: "6677881",
    desire: "rent",
    usage: "health",
    typeId: "pharmacy",
    cityId: "jeddah",
    districtId: "rawdah",
    area: 95,
    price: 95000,
    status: "available",
    ...shots(["shop-02", "shop-01", "office-02", "bldg-04"]),
    street: 25,
    ...pin("jeddah", 0.013, 0.007),
    description: desc(
      "صيدلية للإيجار في موقع خدمي بالروضة، واجهة واسعة وترخيص موقع مناسب للأنشطة الصحية.",
      "Pharmacy for rent in a service location in Al Rawdah, with a wide frontage and a site suitable for health uses.",
    ),
  },
  {
    id: "demo-31",
    ref: "2233445",
    desire: "sale",
    usage: "educational",
    typeId: "school",
    cityId: "riyadh",
    districtId: "narjis",
    area: 2400,
    price: 12500000,
    status: "available",
    ...shots(["bldg-03", "bldg-01", "office-01", "land-03"]),
    street: 24,
    ...pin("riyadh", 0.066, 0.018),
    description: desc(
      "مبنى مدرسي للبيع في النرجس، فصول وملاعب ومكاتب إدارية. يوضح عروض الاستخدام التعليمي.",
      "School building for sale in Al Narjis with classrooms, playgrounds and admin offices. Demonstrates educational listings.",
    ),
  },
  {
    id: "demo-32",
    ref: "8899001",
    desire: "rent",
    usage: "educational",
    typeId: "kindergarten",
    cityId: "khobar",
    districtId: "rakah",
    area: 380,
    price: 140000,
    status: "available",
    ...shots(["villa-09", "apt-03", "office-02", "villa-10"]),
    bathrooms: 4,
    street: 15,
    ...pin("khobar", 0.015, 0.008),
    description: desc(
      "روضة للإيجار في الراكة، فناء آمن وغرف أنشطة وتشطيب مناسب للأطفال.",
      "Kindergarten for rent in Al Rakah with a safe yard, activity rooms and child-friendly finishing.",
    ),
  },
  {
    id: "demo-33",
    ref: "1012458",
    desire: "sale",
    usage: "residential",
    typeId: "apartment",
    cityId: "riyadh",
    districtId: "yasmin",
    area: 145,
    price: 890000,
    status: "sold",
    ...shots(["apt-05", "apt-01", "apt-04", "apt-09"]),
    bedrooms: 2,
    bathrooms: 2,
    livingRooms: 1,
    age: 3,
    street: 16,
    ...pin("riyadh", 0.082, 0.002),
    description: desc(
      "شقة تم بيعها في الياسمين. النموذج يوضح ختم المباعة وكيف تظهر العروض المغلقة للمشتري المحتمل للمنصة.",
      "Sold apartment in Al Yasmin. This sample shows the sold stamp and how closed listings appear to a prospective platform buyer.",
    ),
  },
  {
    id: "demo-34",
    ref: "5566778",
    desire: "rent",
    usage: "residential",
    typeId: "duplex",
    cityId: "taif",
    districtId: "hawiyah",
    area: 310,
    price: 65000,
    status: "available",
    ...shots(["villa-03", "villa-10", "apt-02", "villa-05"]),
    bedrooms: 4,
    bathrooms: 4,
    livingRooms: 2,
    age: 8,
    street: 14,
    ...pin("taif", -0.01, 0.016),
    description: desc(
      "دبلكس للإيجار في الحوية، حديقة خلفية ومدخلين منفصلين.",
      "Duplex for rent in Al Hawiyah with a backyard and two separate entrances.",
    ),
  },
  {
    id: "demo-35",
    ref: "4477123",
    desire: "sale",
    usage: "commercial",
    typeId: "office",
    cityId: "dammam",
    districtId: "faisaliyah",
    area: 310,
    price: 1650000,
    status: "available",
    ...shots(["office-03", "office-02", "bldg-02", "office-01"]),
    bathrooms: 3,
    street: 30,
    ...pin("dammam", 0.006, 0.011),
    description: desc(
      "مكتب للبيع في برج بالفيصلية، إطلالة مفتوحة وتشطيب جاهز للشركات.",
      "Office for sale in a Faisaliyah tower with an open view and corporate-ready finishing.",
    ),
  },
  {
    id: "demo-36",
    ref: "7788990",
    desire: "rent",
    usage: "commercial",
    typeId: "showroom",
    cityId: "dammam",
    districtId: "faisaliyah",
    area: 360,
    price: 175000,
    status: "available",
    ...shots(["shop-01", "bldg-02", "shop-02", "office-03"]),
    street: 36,
    ...pin("dammam", 0.009, 0.004),
    description: desc(
      "معرض للإيجار في موقع تجاري بالدمام، مناسب للسيارات أو الأثاث أو الأجهزة.",
      "Showroom for rent in a Dammam commercial spot, suitable for cars, furniture or appliances.",
    ),
  },
  {
    id: "demo-37",
    ref: "1200345",
    desire: "sale",
    usage: "residential",
    typeId: "tower-apartment",
    cityId: "riyadh",
    districtId: "malqa",
    area: 210,
    price: 2150000,
    status: "available",
    ...shots(["bldg-01", "apt-04", "apt-05", "bldg-03"]),
    bedrooms: 3,
    bathrooms: 3,
    livingRooms: 1,
    age: 0,
    street: 30,
    ...pin("riyadh", 0.058, -0.026),
    description: desc(
      "شقة في برج جديد للبيع في الملقا، تشطيب فاخر ونادي رياضي وحراسة 24 ساعة.",
      "New tower apartment for sale in Al Malqa with luxury finishing, a gym and 24-hour security.",
    ),
  },
  {
    id: "demo-38",
    ref: "9988771",
    desire: "rent",
    usage: "residential",
    typeId: "apartment",
    cityId: "khobar",
    districtId: "olaya",
    area: 155,
    price: 48000,
    status: "available",
    ...shots(["apt-03", "apt-04", "apt-01", "apt-09"]),
    bedrooms: 2,
    bathrooms: 2,
    livingRooms: 1,
    age: 4,
    street: 18,
    ...pin("khobar", 0.008, -0.002),
    description: desc(
      "شقة للإيجار في العليا بالخبر، قريبة من الأعمال والمقاهي ومناسبة للشراء السكني لاحقاً عبر طلب المنصة.",
      "Apartment for rent in Al Olaya, Khobar, close to businesses and cafes, and suitable for a later purchase request via the platform.",
    ),
  },
  {
    id: "demo-39",
    ref: "3654780",
    desire: "sale",
    usage: "residential",
    typeId: "duplex",
    cityId: "dammam",
    districtId: "faisaliyah",
    area: 340,
    price: 2450000,
    status: "available",
    ...shots(["villa-07", "villa-02", "apt-09", "villa-01"]),
    bedrooms: 5,
    bathrooms: 5,
    livingRooms: 2,
    age: 2,
    street: 16,
    ...pin("dammam", 0.004, -0.008),
    description: desc(
      "دبلكس للبيع في الفيصلية بالدمام، حديقة ومجلس خارجي وتصميم حديث.",
      "Duplex for sale in Al Faisaliyah, Dammam, with a garden, outdoor majlis and a contemporary design.",
    ),
  },
  {
    id: "demo-40",
    ref: "2468013",
    desire: "rent",
    usage: "commercial",
    typeId: "building",
    cityId: "jeddah",
    districtId: "hamra",
    area: 980,
    price: 450000,
    status: "available",
    ...shots(["bldg-04", "bldg-02", "bldg-01", "shop-01"]),
    age: 9,
    street: 32,
    ...pin("jeddah", 0.007, 0.011),
    description: desc(
      "عمارة للإيجار كامل في الحمراء، محلات ومكاتب، فرصة تشغيلية واضحة لمشتري المنصة.",
      "Entire building for rent in Al Hamra with shops and offices — a clear operational example for a platform buyer.",
    ),
  },
];

export function getProperty(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function propertyImages(p: Property): string[] {
  if (p.images && p.images.length) return p.images;
  const start = DEMO_GALLERY.indexOf(p.image);
  const rest = DEMO_GALLERY.filter((_, i) => i !== start);
  return [p.image, ...rest].filter(Boolean).slice(0, 4);
}

export interface PropertyView extends Property {
  cityLat: number;
  cityLng: number;
}

export const propertyViews: PropertyView[] = properties.map((p) => {
  const city = getCity(p.cityId);
  return {
    ...p,
    cityLat: city?.lat ?? 24.7136,
    cityLng: city?.lng ?? 46.6753,
  };
});

export function propertyTitle(p: Property, lang: Lang): string {
  const type = getProductType(p.typeId);
  const typeName = type ? type.label[lang] : "";
  const desireName =
    p.desire === "sale"
      ? lang === "ar"
        ? "للبيع"
        : "For Sale"
      : lang === "ar"
        ? "للإيجار"
        : "For Rent";
  return `${typeName} ${desireName}`;
}

export function propertyLocation(p: Property, lang: Lang): string {
  const city = getCity(p.cityId);
  const district = city?.districts.find((d) => d.id === p.districtId);
  const districtName = district?.label[lang] ?? "";
  const cityName = city?.label[lang] ?? "";
  return `${districtName}، ${cityName}`.replace(/^،\s*/, "");
}

export function propertyRegion(p: Property, lang: Lang): string {
  return getRegionByCity(p.cityId)?.label[lang] ?? "";
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US").format(price);

export function propertyLicense(p: Property): string {
  return p.license ?? `72000${p.ref}`;
}

export function similarProperties(p: Property, count = 3): Property[] {
  const scored = properties
    .filter((x) => x.id !== p.id)
    .map((x) => {
      let score = 0;
      if (x.typeId === p.typeId) score += 4;
      if (x.usage === p.usage) score += 2;
      if (x.cityId === p.cityId) score += 2;
      if (x.desire === p.desire) score += 1;
      return { x, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.x);
}
