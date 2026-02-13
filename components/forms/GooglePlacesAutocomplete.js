// /components/forms/GooglePlacesAutocomplete.js
'use client';
import { useState, useEffect, useRef } from 'react';

export default function GooglePlacesAutocomplete({ onAddressSelect, defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      initializeAutocomplete();
    } else {
      // Load Google Places API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setValue(place.formatted_address);

        // Extract address components
        let county = '';
        let state = '';
        let stateShort = '';
        let city = '';
        let zipcode = '';

        if (place.address_components) {
          for (const component of place.address_components) {
            const types = component.types;
            if (types.includes('administrative_area_level_2')) {
              // County
              county = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              // State
              state = component.long_name;
              stateShort = component.short_name;
            }
            if (types.includes('locality')) {
              // City
              city = component.long_name;
            }
            if (types.includes('postal_code')) {
              // Zipcode
              zipcode = component.long_name;
            }
          }
        }

        onAddressSelect({
          address: place.formatted_address,
          latitude: lat,
          longitude: lng,
          county: county,
          state: state,
          stateShort: stateShort,
          city: city,
          zipcode: zipcode,
        });
      }
    });
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter property address..."
      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#472F97] focus:border-[#472F97] outline-none transition-all text-sm"
    />
  );
}
