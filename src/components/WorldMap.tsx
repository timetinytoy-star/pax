import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { Nation, City } from '../game/types';
import { Shield, Swords, Flag, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import * as topojsonClient from 'topojson-client';

const geoUrl = "/world-final.json";

interface WorldMapProps {
  nations: Record<string, Nation>;
  territories: Record<string, { owner: string; originalOwner: string }>;
  cities?: Record<string, City>;
  selectedNationId?: string | null;
  onSelectNation?: (nationId: string) => void;
  animatedNationIds?: string[];
}

const GeoPath = React.memo(({ geo, index, territory, nation, selectedNationId, onSelectNation }: any) => {
  const ownerId = territory?.owner;
  const originalOwnerId = territory?.originalOwner;
  
  const isConquered = ownerId && originalOwnerId && ownerId !== originalOwnerId;
  const isNeutral = !ownerId;
  
  let strokeColor = "rgba(0,0,0,0.5)";
  let strokeWidth = 0.3;
  
  if (ownerId && ownerId === selectedNationId) {
    strokeColor = "#ffffff";
    strokeWidth = 1.5;
  } else if (isConquered) {
    strokeColor = "#ef4444";
    strokeWidth = 1.0;
  }

  return (
    <Geography
      geography={geo}
      onClick={() => {
        if (ownerId && onSelectNation) {
          onSelectNation(ownerId);
        }
      }}
      fill={nation ? nation.color : "#475569"}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      style={{
        default: { outline: "none", cursor: ownerId ? "pointer" : "default" },
        hover: { outline: "none", opacity: 0.8, cursor: ownerId ? "pointer" : "default" },
        pressed: { outline: "none" }
      }}
    >
      <title>
        {geo.properties.name}
        {nation ? `\nSahibi: ${nation.name}` : '\n(Tarafsız Bölge)'}
      </title>
    </Geography>
  );
}, (prevProps, nextProps) => {
  return prevProps.territory?.owner === nextProps.territory?.owner &&
         prevProps.territory?.originalOwner === nextProps.territory?.originalOwner &&
         prevProps.nation?.color === nextProps.nation?.color &&
         prevProps.selectedNationId === nextProps.selectedNationId &&
         prevProps.geo === nextProps.geo;
});

export default function WorldMap({ nations, territories, cities = {}, selectedNationId, onSelectNation, animatedNationIds = [] }: WorldMapProps) {
  const playerNation = Object.values(nations).find(n => n.isPlayer);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        let features = (topojsonClient.feature(data, data.objects.ne_0_countries_clean || data.objects.countries) as any).features;
        // Filter out Antarctica
        features = features.filter((f: any) => f.properties.admin !== 'Antarctica');
        setGeoData(features);
      })
      .catch(err => console.error("Map load error:", err));
  }, []);

  const renderGeographies = React.useCallback(({ geographies }: any) => {
    return geographies.map((geo: any, index: number) => {
      const provId = geo.properties.admin;
      let territory = territories[provId];
      if (!territory) {
        // Fallback for some name mismatches or generated territories that mapped back to full country
        // but now our dataset matchesINITIAL_TERRITORIES mapName directly.
      }
      const ownerId = territory?.owner;
      
      const nation = ownerId ? nations[ownerId] : null;

      return (
        <GeoPath
          key={`geo_${provId}_${index}`}
          geo={geo}
          index={index}
          territory={territory}
          nation={nation}
          selectedNationId={selectedNationId}
          onSelectNation={onSelectNation}
        />
      );
    });
  }, [territories, nations, selectedNationId, onSelectNation]);

  if (!geoData) return <div className="w-full h-full flex items-center justify-center text-white">Harita Yükleniyor...</div>;

  return (
    <div className="w-full h-full bg-[#0a192f] overflow-hidden relative shadow-inner">
      <ComposableMap projectionConfig={{ scale: 200, center: [20, 35] }} className="w-full h-full transition-all duration-300">
        <ZoomableGroup center={[20, 35]} zoom={2} minZoom={1} maxZoom={8}>
          <Geographies geography={geoData}>
            {renderGeographies}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
