import { HttpError } from '../errors/http-error';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

type NominatimResult = {
  lat: string;
  lon: string;
};

const CITY_FALLBACKS: Array<Coordinates & { aliases: string[] }> = [
  { aliases: ['casablanca', 'casa'], latitude: 33.5731, longitude: -7.5898 },
  { aliases: ['rabat'], latitude: 33.9716, longitude: -6.8498 },
  { aliases: ['tanger', 'tangier'], latitude: 35.7673, longitude: -5.7998 },
  { aliases: ['fes', 'fez'], latitude: 34.0331, longitude: -5.0003 },
  { aliases: ['marrakech', 'marrakesh'], latitude: 31.6295, longitude: -7.9811 },
  { aliases: ['agadir'], latitude: 30.4278, longitude: -9.5981 },
  { aliases: ['meknes'], latitude: 33.8935, longitude: -5.5473 },
  { aliases: ['oujda'], latitude: 34.6814, longitude: -1.9086 },
  { aliases: ['tetouan'], latitude: 35.5889, longitude: -5.3626 },
  { aliases: ['kenitra'], latitude: 34.2610, longitude: -6.5802 },
  { aliases: ['sale'], latitude: 34.0531, longitude: -6.7985 },
  { aliases: ['el jadida'], latitude: 33.2316, longitude: -8.5007 },
];

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const findFallbackCoordinates = (address: string): Coordinates | null => {
  const normalizedAddress = normalize(address);
  const city = CITY_FALLBACKS.find(({ aliases }) =>
    aliases.some((alias) => normalizedAddress.includes(alias)),
  );

  return city === undefined
    ? null
    : { latitude: city.latitude, longitude: city.longitude };
};

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

export class GeocodingService {
  private readonly cache = new Map<string, Coordinates>();
  private lastRemoteRequestAt = 0;

  public constructor(
    private readonly endpoint =
      process.env.GEOCODING_URL ??
      'https://nominatim.openstreetmap.org/search',
    private readonly userAgent =
      process.env.GEOCODING_USER_AGENT ??
      'SmartResources/1.0 (https://github.com/YahyaM15/Projet_Dev_Web-YZS)',
  ) {}

  public async geocode(address: string): Promise<Coordinates> {
    const cacheKey = normalize(address.trim());
    const cached = this.cache.get(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const remoteCoordinates = await this.geocodeWithNominatim(address);
    const coordinates =
      remoteCoordinates ?? findFallbackCoordinates(address);

    if (coordinates === null) {
      throw new HttpError(
        422,
        'Adresse introuvable. Précisez au minimum une ville marocaine valide.',
      );
    }

    this.cache.set(cacheKey, coordinates);
    return coordinates;
  }

  private async geocodeWithNominatim(
    address: string,
  ): Promise<Coordinates | null> {
    const elapsed = Date.now() - this.lastRemoteRequestAt;

    if (elapsed < 1_100) {
      await sleep(1_100 - elapsed);
    }

    const query = /maroc|morocco/i.test(address)
      ? address
      : `${address}, Maroc`;

    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'ma',
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    try {
      this.lastRemoteRequestAt = Date.now();

      const response = await fetch(
        `${this.endpoint}?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'fr',
            'User-Agent': this.userAgent,
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        return null;
      }

      const results = (await response.json()) as NominatimResult[];
      const firstResult = results[0];

      if (firstResult === undefined) {
        return null;
      }

      const latitude = Number(firstResult.lat);
      const longitude = Number(firstResult.lon);

      return Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null;
    } catch (error) {
      console.warn(
        'Geocoding service unavailable; using the local city fallback when possible.',
        error instanceof Error ? error.message : error,
      );

      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
