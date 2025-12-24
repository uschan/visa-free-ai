import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { VisaRequirement, VisaStatus } from '../types';

interface WorldMapProps {
  data: VisaRequirement[];
  onCountryClick: (isoCode: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, onCountryClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);

  // Status to Color mapping
  const getColor = (iso: string) => {
    const country = data.find(d => d.isoCode === iso);
    if (!country) return '#e5e7eb'; // Gray-200 for no data
    switch (country.status) {
      case VisaStatus.VISA_FREE: return '#22c55e'; // Green-500
      case VisaStatus.VISA_ON_ARRIVAL: return '#3b82f6'; // Blue-500
      case VisaStatus.ELECTRONIC_TRAVEL_AUTH: return '#f59e0b'; // Amber-500
      case VisaStatus.VISA_REQUIRED: return '#f43f5e'; // Rose-500
      default: return '#e5e7eb';
    }
  };

  useEffect(() => {
    // Fetch world topology
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setGeoData(countries);
      });
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Clear previous
    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .fitSize([width, height], geoData)
      .translate([width / 2, height / 1.6]); // Shift up slightly to avoid Antarctica space

    const pathGenerator = d3.geoPath().projection(projection);

    const g = svg.append('g');

    // Draw Countries
    g.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('class', 'country')
      .attr('fill', (d: any) => getColor(d.id || d.properties.iso_a3)) // TopoJSON uses IDs often
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('click', (event, d: any) => {
         // Some topojson uses ISO number ID, we need to map or just use available ID
         // For the demo, we assume the ID matches or is mappable, passing raw ID back
         // In production, we'd map Numeric ISO to Alpha-3
         onCountryClick(d.id); 
      })
      .append('title')
      .text((d: any) => d.properties.name);

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

  }, [geoData, data]); // Re-render when data changes

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-blue-50 rounded-xl overflow-hidden border border-blue-100 shadow-inner relative">
       <svg ref={svgRef} className="w-full h-full" />
       <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded text-xs shadow backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Visa Free</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> VoA</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> e-Visa</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Visa Required</div>
       </div>
    </div>
  );
};

export default WorldMap;
