import { useEffect, useMemo, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet';
import {
  AlertTriangle,
  Droplets,
  Map as MapIcon,
  Zap,
} from 'lucide-react';
import { alertApi, resourceApi } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { Alert, Meter } from '../types';

type MeterWithCoordinates = Meter & {
  latitude: number;
  longitude: number;
};

type MapFilter = 'ALL' | 'WATER' | 'ELECTRICITY' | 'ALERTS';

function hasCoordinates(meter: Meter): meter is MeterWithCoordinates {
  return (
    typeof meter.latitude === 'number' &&
    typeof meter.longitude === 'number'
  );
}

export function MapPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMeter, setSelectedMeter] =
    useState<MeterWithCoordinates | null>(null);

  const [activeFilter, setActiveFilter] =
    useState<MapFilter>('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [metersResponse, alertsResponse] = await Promise.all([
          resourceApi.getAll(),
          alertApi.getAll({ resolved: 'false' }),
        ]);

        setMeters(metersResponse.data);

        setAlerts(
          alertsResponse.data.filter(
            (alert) => !alert.isResolved,
          ),
        );
      } catch {
        setError(
          'Impossible de charger les compteurs et les alertes. Vérifiez que le serveur est démarré.',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const metersWithCoordinates = useMemo(
    () => meters.filter(hasCoordinates),
    [meters],
  );

  const activeAlertMeterIds = useMemo(
    () => new Set(alerts.map((alert) => alert.meterId)),
    [alerts],
  );

  const filteredMeters = useMemo(() => {
    switch (activeFilter) {
      case 'WATER':
        return metersWithCoordinates.filter(
          (meter) => meter.type === 'WATER',
        );

      case 'ELECTRICITY':
        return metersWithCoordinates.filter(
          (meter) => meter.type === 'ELECTRICITY',
        );

      case 'ALERTS':
        return metersWithCoordinates.filter((meter) =>
          activeAlertMeterIds.has(meter.id),
        );

      case 'ALL':
      default:
        return metersWithCoordinates;
    }
  }, [
    activeFilter,
    activeAlertMeterIds,
    metersWithCoordinates,
  ]);

  const meterCounts = useMemo(
    () => ({
      all: metersWithCoordinates.length,

      water: metersWithCoordinates.filter(
        (meter) => meter.type === 'WATER',
      ).length,

      electricity: metersWithCoordinates.filter(
        (meter) => meter.type === 'ELECTRICITY',
      ).length,

      alerts: metersWithCoordinates.filter((meter) =>
        activeAlertMeterIds.has(meter.id),
      ).length,
    }),
    [activeAlertMeterIds, metersWithCoordinates],
  );

  const bounds = useMemo(
    () =>
      metersWithCoordinates.map(
        (meter) =>
          [
            meter.latitude,
            meter.longitude,
          ] as [number, number],
      ),
    [metersWithCoordinates],
  );

  /*
   * Si le compteur sélectionné disparaît après l'application
   * d'un filtre, on ferme son panneau de détails.
   */
  useEffect(() => {
    if (
      selectedMeter &&
      !filteredMeters.some(
        (meter) => meter.id === selectedMeter.id,
      )
    ) {
      setSelectedMeter(null);
    }
  }, [filteredMeters, selectedMeter]);

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-semibold text-slate-100">
          Carte interactive
        </h1>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">
          Carte interactive
        </h1>

        <p className="text-sm text-slate-400">
          {meters.length} compteurs · {alerts.length}{' '}
          alerte(s) active(s)
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {metersWithCoordinates.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <EmptyState
            icon={MapIcon}
            title="Aucune donnée de localisation"
            description="Les compteurs ne possèdent pas de coordonnées GPS."
          />
        </div>
      ) : (
        <>
          {/* Filtres de la carte */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`rounded-xl border px-4 py-2 text-sm transition ${
                activeFilter === 'ALL'
                  ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
                  : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              Tous ({meterCounts.all})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('WATER')}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                activeFilter === 'WATER'
                  ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
                  : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <Droplets className="h-4 w-4" />
              Eau ({meterCounts.water})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('ELECTRICITY')}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                activeFilter === 'ELECTRICITY'
                  ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                  : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <Zap className="h-4 w-4" />
              Électricité ({meterCounts.electricity})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('ALERTS')}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                activeFilter === 'ALERTS'
                  ? 'border-rose-400 bg-rose-400/15 text-rose-300'
                  : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Avec alerte ({meterCounts.alerts})
            </button>

            <span className="text-xs text-slate-500 sm:ml-auto">
              {filteredMeters.length} compteur(s) affiché(s)
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Carte */}
            <div className="overflow-hidden rounded-2xl border border-white/10 lg:col-span-2">
              <MapContainer
                bounds={bounds}
                boundsOptions={{ padding: [40, 40] }}
                scrollWheelZoom
                className="h-[500px] w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredMeters.map((meter) => {
                  const isWater = meter.type === 'WATER';

                  const hasAlert =
                    activeAlertMeterIds.has(meter.id);

                  const isSelected =
                    selectedMeter?.id === meter.id;

                  return (
                    <CircleMarker
                      key={meter.id}
                      center={[
                        meter.latitude,
                        meter.longitude,
                      ]}
                      radius={isSelected ? 13 : 10}
                      pathOptions={{
                        color: hasAlert
                          ? '#f43f5e'
                          : isWater
                            ? '#22d3ee'
                            : '#fbbf24',

                        fillColor: isWater
                          ? '#06b6d4'
                          : '#f59e0b',

                        fillOpacity: 0.85,
                        weight: hasAlert ? 4 : 2,
                      }}
                      eventHandlers={{
                        click: () =>
                          setSelectedMeter(meter),
                      }}
                    >
                      <Popup>
                        <div className="min-w-[190px]">
                          <p className="mb-2 font-semibold text-slate-900">
                            {meter.serialNumber}
                          </p>

                          <p className="mb-1 text-sm text-slate-700">
                            Type :{' '}
                            {isWater
                              ? 'Compteur d’eau'
                              : 'Compteur électrique'}
                          </p>

                          <p className="mb-1 text-sm text-slate-700">
                            Adresse : {meter.location}
                          </p>

                          {hasAlert && (
                            <p className="mt-2 font-medium text-rose-600">
                              Alerte active
                            </p>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-3">
              {selectedMeter ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                  <h3 className="mb-3 text-sm font-semibold text-slate-100">
                    Détails du compteur
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between gap-4">
                      <span className="text-xs text-slate-400">
                        Numéro de série
                      </span>

                      <span className="text-right font-mono text-xs text-slate-200">
                        {selectedMeter.serialNumber}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-xs text-slate-400">
                        Type
                      </span>

                      <span className="text-xs text-slate-200">
                        {selectedMeter.type === 'WATER'
                          ? 'Eau'
                          : 'Électricité'}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-xs text-slate-400">
                        Adresse
                      </span>

                      <span className="max-w-[180px] text-right text-xs text-slate-200">
                        {selectedMeter.location}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-xs text-slate-400">
                        Coordonnées
                      </span>

                      <span className="text-right font-mono text-xs text-slate-200">
                        {selectedMeter.latitude.toFixed(4)},{' '}
                        {selectedMeter.longitude.toFixed(4)}
                      </span>
                    </div>

                    {activeAlertMeterIds.has(
                      selectedMeter.id,
                    ) && (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Alerte active
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                  <p className="text-sm text-slate-400">
                    Cliquez sur un compteur pour afficher ses
                    détails.
                  </p>
                </div>
              )}

              {/* Légende */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                <h3 className="mb-3 text-sm font-semibold text-slate-100">
                  Légende
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-400" />

                    <span className="text-xs text-slate-400">
                      Compteur d’eau
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />

                    <span className="text-xs text-slate-400">
                      Compteur électrique
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />

                    <span className="text-xs text-slate-400">
                      Compteur avec alerte active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}